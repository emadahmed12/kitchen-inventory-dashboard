-- 004 — Add notes to storage locations
ALTER TABLE public.storage_locations
  ADD COLUMN IF NOT EXISTS notes TEXT;
