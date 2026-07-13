-- Server-side LWW guard (handoff §6.5: upsert "where incoming updated_at newer").
-- Client upserts are unconditional, so without this a device flushing a stale
-- row or tombstone can clobber a newer write from another device — e.g. an old
-- tombstone re-push overwriting a re-created soul. Rejecting the UPDATE half of
-- an upsert when the incoming updated_at is older makes every write LWW-safe
-- regardless of client behavior; the skipped upsert still reports success,
-- which is correct (the newer data stays and the client's next pull wins).

CREATE OR REPLACE FUNCTION public.souls_lww_guard() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.updated_at < OLD.updated_at THEN
    RETURN NULL; -- silently keep the newer existing row
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS souls_lww ON public.souls;
CREATE TRIGGER souls_lww
  BEFORE UPDATE ON public.souls
  FOR EACH ROW EXECUTE FUNCTION public.souls_lww_guard();
