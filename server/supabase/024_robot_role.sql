-- Dedicated robot role for physical AERO-BOT units.
-- Focused on Hub Lingkungan + robot display without Kelola kawasan or Laporan lingkungan.
begin;

alter table public.ae_members
  drop constraint if exists ae_members_role_check;
alter table public.ae_members
  add constraint ae_members_role_check
  check (role in ('viewer', 'robot', 'operator', 'admin', 'auditor'));

alter table public.ae_role_requests
  drop constraint if exists ae_role_requests_granted_role_check;
alter table public.ae_role_requests
  add constraint ae_role_requests_granted_role_check
  check (granted_role is null or granted_role in ('viewer', 'robot', 'operator', 'auditor', 'admin'));

create or replace function public.ae_review_role_request(
  p_request uuid, p_staff uuid, p_action text, p_location text, p_role text, p_note text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare r ae_role_requests;
begin
  if not exists(select 1 from ae_staff where user_id = p_staff) then
    raise exception 'Hanya tim AEROSENSE yang dapat memverifikasi peran' using errcode = '42501';
  end if;
  select * into r from ae_role_requests where id = p_request and status = 'pending' for update;
  if r.id is null then raise exception 'Permintaan tidak ditemukan atau sudah diproses' using errcode = 'P0002'; end if;
  if p_action = 'reject' then
    update ae_role_requests set status = 'rejected', reviewed_by = p_staff, reviewed_at = now(),
      review_note = nullif(left(p_note, 500), '') where id = r.id;
    return jsonb_build_object('status', 'rejected');
  end if;
  if p_action <> 'approve' or p_role not in ('viewer','robot','operator','auditor','admin')
     or p_location is null or p_location !~ '^[a-zA-Z0-9_-]{2,40}$' then
    raise exception 'Pilih lokasi dan peran yang valid' using errcode = '22023';
  end if;
  insert into ae_members(user_id, location_id, role) values (r.user_id, p_location, p_role)
  on conflict (user_id, location_id) do update set role = excluded.role;
  update ae_role_requests set status = 'approved', location_id = p_location, granted_role = p_role,
    reviewed_by = p_staff, reviewed_at = now(), review_note = nullif(left(p_note, 500), '') where id = r.id;
  return jsonb_build_object('status', 'approved', 'location_id', p_location, 'role', p_role);
end $$;

commit;
