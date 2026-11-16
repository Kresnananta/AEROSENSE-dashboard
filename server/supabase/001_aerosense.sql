-- Run once in Supabase SQL Editor. Isolated ae_ names avoid existing tables.
begin;
create table public.ae_nodes (
 id text primary key check(id ~ '^[a-zA-Z0-9_-]{1,40}$'), name text not null,
 gateway_id text not null, location_id text not null,
 latitude double precision not null check(latitude between -90 and 90),
 longitude double precision not null check(longitude between -180 and 180),
 enabled boolean not null default true,
 pm25_validated boolean not null default false,
 calibration_version text,
 created_at timestamptz not null default now()
);
create table public.ae_members (
 user_id uuid references auth.users(id) on delete cascade,
 location_id text not null, role text not null check(role in ('viewer','operator','admin','auditor')),
 primary key(user_id,location_id)
);
create table public.ae_readings (
 id uuid primary key default gen_random_uuid(), node_id text not null references public.ae_nodes,
 boot_id text not null, sequence bigint not null check(sequence>=0),
 observed_at timestamptz not null, received_at timestamptz not null default now(),
 metrics jsonb not null, gru jsonb, quality jsonb not null default '{}',
 unique(node_id,boot_id,sequence)
);
create index on public.ae_readings(node_id, observed_at desc);
create table public.ae_latest (
 node_id text primary key references public.ae_nodes, reading_id uuid references public.ae_readings,
 observed_at timestamptz not null, received_at timestamptz not null,
 metrics jsonb not null, gru jsonb, quality jsonb not null
);
create table public.ae_rules (
 id uuid primary key default gen_random_uuid(), node_id text not null references public.ae_nodes,
 metric text not null check(metric in ('dust_ug_m3','pm25_ug_m3','eco2_ppm','tvoc_ppb','temperature_c','humidity_pct')),
 high double precision not null, clear_below double precision not null,
 enabled boolean not null default false, unit text not null,
 cooldown_seconds integer not null default 1800 check(cooldown_seconds >= 60),
 active boolean not null default false, last_alert_at timestamptz,
 check(clear_below<high), unique(node_id,metric)
);
create table public.ae_alerts (
 id uuid primary key default gen_random_uuid(), node_id text not null references public.ae_nodes,
 reading_id uuid references public.ae_readings, rule_id uuid references public.ae_rules,
 metric text not null, value double precision, threshold double precision, unit text,
 created_at timestamptz not null default now(), acknowledged_by uuid references auth.users,
 acknowledged_at timestamptz,
 unique(reading_id,rule_id)
);
create table public.ae_jobs (
 id uuid primary key default gen_random_uuid(), kind text not null,
 dedupe_key text not null unique, owner_id uuid references auth.users on delete cascade,
 body jsonb not null, result jsonb, stage jsonb not null default '{}',
 status text not null default 'pending' check(status in ('pending','running','done','failed')),
 attempts integer not null default 0, available_at timestamptz not null default now(),
 lease_token uuid, lease_until timestamptz, last_error text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index on public.ae_jobs(kind,status,available_at);
create table public.ae_contacts (
 phone text primary key check(phone ~ '^[0-9]{8,15}$'), last_inbound_at timestamptz not null,
 last_provider_status jsonb
);
create table public.ae_subscriptions (
 phone text references public.ae_contacts on delete cascade, node_id text references public.ae_nodes,
 user_id uuid not null references auth.users on delete cascade,
 opted_in_at timestamptz not null default now(), active boolean not null default true,
 primary key(phone,node_id)
);
create table public.ae_pair_codes (
 code_hash text primary key, user_id uuid not null references auth.users on delete cascade,
 node_id text not null references public.ae_nodes, expires_at timestamptz not null,
 used_at timestamptz, used_by text
);
create table public.ae_robots (
 id text primary key, node_id text not null references public.ae_nodes,
 enabled boolean not null default true, quiet boolean not null default false,
 presence_cooldown_seconds integer not null default 120 check(presence_cooldown_seconds>=30),
 last_presence_at timestamptz, last_seen_at timestamptz
);
create table public.ae_commands (
 id uuid primary key default gen_random_uuid(), robot_id text not null references public.ae_robots,
 dedupe_key text not null unique, priority integer not null default 10,
 body jsonb not null, state text not null default 'pending' check(state in ('pending','leased','done','expired','failed')),
 expires_at timestamptz not null, lease_until timestamptz,
 created_at timestamptz not null default now(), completed_at timestamptz
);
create index on public.ae_commands(robot_id,state,priority desc);

create function public.ae_can_read(p_node text) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from ae_members m join ae_nodes n on n.location_id=m.location_id where m.user_id=auth.uid() and n.id=p_node)
$$;
create function public.ae_ingest(p jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare r ae_readings; n ae_nodes;
begin
 select * into strict n from ae_nodes where id=p->>'node_id' and enabled;
 insert into ae_readings(node_id,boot_id,sequence,observed_at,metrics,gru,quality)
 values(n.id,p->>'boot_id',(p->>'sequence')::bigint,(p->>'observed_at')::timestamptz,p->'metrics',p->'gru',coalesce(p->'quality','{}'))
 on conflict(node_id,boot_id,sequence) do nothing returning * into r;
 if r.id is null then return jsonb_build_object('duplicate',true); end if;
 insert into ae_latest values(n.id,r.id,r.observed_at,r.received_at,r.metrics,r.gru,r.quality)
 on conflict(node_id) do update set reading_id=excluded.reading_id, observed_at=excluded.observed_at,
 received_at=excluded.received_at,metrics=excluded.metrics,gru=excluded.gru,quality=excluded.quality
 where ae_latest.observed_at < excluded.observed_at;
 insert into ae_jobs(kind,dedupe_key,body) values('telemetry','reading:'||r.id,jsonb_build_object('reading_id',r.id));
 return jsonb_build_object('reading_id',r.id,'duplicate',false);
end $$;

create function public.ae_claim(p_kind text, p_limit int default 5) returns setof public.ae_jobs language plpgsql security definer set search_path=public as $$
begin
 update ae_jobs set status='failed',last_error='Maximum attempts or job age exceeded',updated_at=now()
 where kind=p_kind and status in ('pending','running') and (attempts>=5 or created_at<now()-interval '24 hours') and (lease_until is null or lease_until<now());
 return query with picked as (
 select id from ae_jobs where kind=p_kind and attempts<5 and available_at<=now()
 and (status='pending' or (status='running' and lease_until<now()))
 order by created_at for update skip locked limit least(greatest(p_limit,1),10)
 ) update ae_jobs j set status='running',attempts=attempts+1,lease_token=gen_random_uuid(),
 lease_until=now()+interval '5 minutes',updated_at=now() from picked where j.id=picked.id returning j.*;
end $$;
create function public.ae_stage(p_id uuid,p_token uuid,p_stage jsonb) returns boolean language plpgsql security definer set search_path=public as $$
begin
 update ae_jobs set stage=stage||p_stage,updated_at=now(),lease_until=now()+interval '5 minutes'
 where id=p_id and lease_token=p_token and status='running' and lease_until>now();
 return found;
end $$;
create function public.ae_finish(p_id uuid,p_token uuid,p_result jsonb) returns boolean language plpgsql security definer set search_path=public as $$
begin
 update ae_jobs set status='done',result=p_result,stage='{}',body=body-'audio_base64',updated_at=now(),lease_until=null
 where id=p_id and lease_token=p_token and status='running' and lease_until>now();
 return found;
end $$;
create function public.ae_retry(p_id uuid,p_token uuid,p_error text) returns boolean language plpgsql security definer set search_path=public as $$
begin
 update ae_jobs set status=case when attempts>=5 then 'failed' else 'pending' end,
 available_at=now()+make_interval(secs=>least(3600,30*power(2,attempts)::int)),
 last_error=left(p_error,300),lease_until=null,updated_at=now()
 where id=p_id and lease_token=p_token and status='running';
 return found;
end $$;

-- Atomic rules, alert fanout and robot interruption are committed together.
create function public.ae_evaluate(p_reading uuid) returns int language plpgsql security definer set search_path=public as $$
declare r ae_readings; rule ae_rules; val float8; aid uuid; count_alerts int:=0; message text; n ae_nodes;
begin
 select * into strict r from ae_readings where id=p_reading;
 select * into strict n from ae_nodes where id=r.node_id;
 if r.observed_at < now()-interval '10 minutes' or coalesce((r.quality->>'invalid')::boolean,false) then return 0; end if;
 for rule in select * from ae_rules where node_id=r.node_id and enabled order by id for update loop
  if rule.metric='pm25_ug_m3' and not n.pm25_validated then continue; end if;
  if not r.metrics ? rule.metric or jsonb_typeof(r.metrics->rule.metric) <> 'number' then continue; end if;
  val:=(r.metrics->>rule.metric)::float8;
  if val<=rule.clear_below then update ae_rules set active=false where id=rule.id; end if;
  if val>=rule.high and (not rule.active or rule.last_alert_at is null or rule.last_alert_at<now()-make_interval(secs=>rule.cooldown_seconds)) then
   insert into ae_alerts(node_id,reading_id,rule_id,metric,value,threshold,unit)
   values(r.node_id,r.id,rule.id,rule.metric,val,rule.high,rule.unit)
   on conflict(reading_id,rule_id) do nothing returning id into aid;
   if aid is not null then
    update ae_rules set active=true,last_alert_at=now() where id=rule.id;
    message:=format('AEROSENSE: %s. %s terukur %s %s, melewati ambang operasional %s. Waktu %s. Kurangi paparan dan periksa sumber polusi. Hubungi pengelola bila kondisi memburuk.',n.name,rule.metric,val,rule.unit,rule.high,to_char(r.observed_at at time zone 'Asia/Jakarta','DD Mon HH24:MI')||' WIB');
    insert into ae_jobs(kind,dedupe_key,owner_id,body)
    select 'wa_send','alert:'||aid||':'||s.phone,s.user_id,jsonb_build_object('phone',s.phone,'text',message,'alert_id',aid,'node_id',n.id,'template_vars',jsonb_build_array(n.name,rule.metric,val||' '||rule.unit||' pada '||r.observed_at))
    from ae_subscriptions s where s.node_id=n.id and s.active and exists(select 1 from ae_members m where m.user_id=s.user_id and m.location_id=n.location_id)
    on conflict(dedupe_key) do nothing;
    insert into ae_commands(robot_id,dedupe_key,priority,body,expires_at)
    select id,'alert:'||aid||':'||id,100,jsonb_build_object('action','alert','text',message,'face','alert','interrupt',true,'fallback','alert'),now()+interval '5 minutes'
    from ae_robots where node_id=n.id and enabled on conflict(dedupe_key) do nothing;
    count_alerts:=count_alerts+1;
   end if;
  end if;
 end loop;
 return count_alerts;
end $$;

create function public.ae_presence(p_robot text,p_event text) returns uuid language plpgsql security definer set search_path=public as $$
declare rob ae_robots; jid uuid;
begin
 select * into strict rob from ae_robots where id=p_robot and enabled for update;
 update ae_robots set last_seen_at=now() where id=p_robot;
 if rob.quiet or (rob.last_presence_at is not null and rob.last_presence_at>now()-make_interval(secs=>rob.presence_cooldown_seconds)) then return null; end if;
 update ae_robots set last_presence_at=now() where id=p_robot;
 insert into ae_jobs(kind,dedupe_key,body) values('robot_chat','robot:'||p_robot||':'||p_event,jsonb_build_object('robot_id',p_robot,'node_ids',jsonb_build_array(rob.node_id),'text','Sapa pengguna lalu jelaskan kondisi udara terbaru dan satu langkah menjaga lingkungan.','presence',true))
 on conflict(dedupe_key) do update set dedupe_key=excluded.dedupe_key returning id into jid;
 return jid;
end $$;
create function public.ae_robot_claim(p_robot text) returns setof public.ae_commands language plpgsql security definer set search_path=public as $$
begin
 update ae_robots set last_seen_at=now() where id=p_robot;
 update ae_commands set state='expired' where robot_id=p_robot and expires_at<=now() and state in ('pending','leased');
 return query with picked as (
 select id from ae_commands where robot_id=p_robot and expires_at>now() and (state='pending' or (state='leased' and lease_until<now()))
 order by priority desc,created_at for update skip locked limit 1
 ) update ae_commands c set state='leased',lease_until=now()+interval '120 seconds' from picked where c.id=picked.id returning c.*;
end $$;
create function public.ae_pair(p_hash text,p_phone text) returns text language plpgsql security definer set search_path=public as $$
declare c ae_pair_codes; n ae_nodes;
begin
 select * into c from ae_pair_codes where code_hash=p_hash and expires_at>now() for update;
 if c.code_hash is null then return null; end if;
 if c.used_at is not null and c.used_by is distinct from p_phone then return null; end if;
 select * into strict n from ae_nodes where id=c.node_id;
 if not exists(select 1 from ae_members where user_id=c.user_id and location_id=n.location_id) then return null; end if;
 update ae_pair_codes set used_at=coalesce(used_at,now()),used_by=p_phone where code_hash=p_hash;
 insert into ae_subscriptions(phone,node_id,user_id) values(p_phone,c.node_id,c.user_id)
 on conflict(phone,node_id) do update set user_id=excluded.user_id,active=true,opted_in_at=now();
 return n.name;
end $$;
create function public.ae_maintenance() returns jsonb language plpgsql security definer set search_path=public as $$
declare n ae_nodes; total int:=0;
begin
 for n in select x.* from ae_nodes x left join ae_latest l on l.node_id=x.id where x.enabled and (l.observed_at is null or l.observed_at<now()-interval '15 minutes') loop
  insert into ae_jobs(kind,dedupe_key,status,body,result)
  values('operational','offline:'||n.id||':'||to_char(now(),'YYYYMMDDHH24'),'done',jsonb_build_object('node_id',n.id,'reason','Sensor tidak mengirim data terbaru selama 15 menit'),jsonb_build_object('stale',true)) on conflict(dedupe_key) do nothing;
  total:=total+1;
 end loop;
 update ae_commands set state='expired' where expires_at<now() and state in ('pending','leased');
 delete from ae_pair_codes where expires_at<now()-interval '1 day';
 delete from ae_jobs where status in ('done','failed') and created_at<now()-interval '7 days';
 delete from ae_commands where created_at<now()-interval '7 days';
 return jsonb_build_object('stale_nodes',total);
end $$;

-- Service writes only. Users read only authorized locations and their own jobs.
alter table ae_nodes enable row level security;
alter table ae_members enable row level security;
alter table ae_readings enable row level security;
alter table ae_latest enable row level security;
alter table ae_rules enable row level security;
alter table ae_alerts enable row level security;
alter table ae_jobs enable row level security;
alter table ae_contacts enable row level security;
alter table ae_subscriptions enable row level security;
alter table ae_pair_codes enable row level security;
alter table ae_robots enable row level security;
alter table ae_commands enable row level security;
create policy members_own on ae_members for select to authenticated using(user_id=auth.uid());
create policy nodes_member on ae_nodes for select to authenticated using(ae_can_read(id));
create policy readings_member on ae_readings for select to authenticated using(ae_can_read(node_id));
create policy latest_member on ae_latest for select to authenticated using(ae_can_read(node_id));
create policy alerts_member on ae_alerts for select to authenticated using(ae_can_read(node_id));
create policy rules_member on ae_rules for select to authenticated using(ae_can_read(node_id));
-- Chat results are obtained through the API, never expose audio or delivery payloads through PostgREST.
grant select on ae_members,ae_nodes,ae_readings,ae_latest,ae_rules,ae_alerts to authenticated;
revoke all on ae_jobs,ae_contacts,ae_subscriptions,ae_pair_codes,ae_robots,ae_commands from anon,authenticated;
grant all on ae_nodes,ae_members,ae_readings,ae_latest,ae_rules,ae_alerts,ae_jobs,ae_contacts,ae_subscriptions,ae_pair_codes,ae_robots,ae_commands to service_role;
do $$ declare f record; begin
 for f in select oid::regprocedure as signature from pg_proc where pronamespace='public'::regnamespace and proname like 'ae_%' and proname<>'ae_can_read' loop
 execute format('revoke execute on function %s from public,anon,authenticated',f.signature);
 execute format('grant execute on function %s to service_role',f.signature);
 end loop;
end $$;
revoke execute on function ae_can_read(text) from public,anon;
grant execute on function ae_can_read(text) to authenticated,service_role;
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='ae_latest') then alter publication supabase_realtime add table ae_latest; end if;
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='ae_alerts') then alter publication supabase_realtime add table ae_alerts; end if;
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('aerosense-audio','aerosense-audio',false,2000000,array['audio/wav']) on conflict(id) do nothing;
commit;
