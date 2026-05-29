-- ============================================================
-- 002 — Dynamic Storage Locations
-- ============================================================
-- The id column is TEXT so existing static references like
-- 'kitchen', 'fridge', 'freezer', 'pantry' can be preserved
-- verbatim when seeding default locations for a new user.
-- User-created locations receive a gen_random_uuid() id.
-- Composite PK (id, user_id) allows the same slug to exist
-- independently per user.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.storage_locations (
  id          TEXT        NOT NULL,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT        NOT NULL,
  type        TEXT        NOT NULL DEFAULT 'other'
              CHECK (type IN ('fridge','freezer','pantry','cabinet','counter','other')),
  capacity    INTEGER     NOT NULL DEFAULT 10 CHECK (capacity > 0 AND capacity <= 500),
  color       TEXT,
  icon        TEXT,
  is_default  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_storage_locations_user_id
  ON public.storage_locations(user_id);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.storage_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "storage_select_own" ON public.storage_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "storage_insert_own" ON public.storage_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "storage_update_own" ON public.storage_locations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "storage_delete_own" ON public.storage_locations
  FOR DELETE USING (auth.uid() = user_id);

-- ── updated_at trigger ───────────────────────────────────────
CREATE TRIGGER trg_storage_locations_updated_at
  BEFORE UPDATE ON public.storage_locations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Realtime ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.storage_locations;
