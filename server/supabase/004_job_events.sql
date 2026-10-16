CREATE OR REPLACE FUNCTION public.ae_n8n_notify_job()
RETURNS trigger LANGUAGE plpgsql SET search_path = pg_catalog, public AS $$
BEGIN
  IF NEW.status = 'pending' AND NEW.kind IN ('telemetry','web_chat','wa_inbox','wa_chat','wa_send','robot_chat') THEN
    PERFORM pg_notify('aerosense_events', json_build_object('job_id', NEW.id, 'kind', NEW.kind)::text);
  END IF;
  RETURN NEW;
END;
$$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'public.ae_jobs'::regclass
      AND tgname = 'ae_n8n_job_created'
  ) THEN
    CREATE TRIGGER ae_n8n_job_created
    AFTER INSERT ON public.ae_jobs
    FOR EACH ROW EXECUTE FUNCTION public.ae_n8n_notify_job();
  END IF;
END;
$$;
SELECT 'aerosense_events' AS channel, 'ready' AS status;
