-- ============================================================
-- 003 — Shopping Sessions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shopping_sessions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'active'
              CHECK (status IN ('active','completed','cancelled')),
  started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shopping_session_items (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id          UUID        REFERENCES public.shopping_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id             UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  inventory_item_id   UUID        REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  name                TEXT        NOT NULL,
  unit                TEXT        NOT NULL DEFAULT 'bag',
  needed_qty          NUMERIC(10,2) NOT NULL DEFAULT 0,
  bought_qty          NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_stock       NUMERIC(10,2) NOT NULL DEFAULT 0,
  state               TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (state IN ('pending','partial','purchased','skipped')),
  sort_order          INTEGER     NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_sessions_user_id
  ON public.shopping_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_session_items_session_id
  ON public.shopping_session_items(session_id);

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.shopping_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_session_items  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_own" ON public.shopping_sessions
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "session_items_own" ON public.shopping_session_items
  FOR ALL USING (auth.uid() = user_id);

-- ── triggers ────────────────────────────────────────────────
CREATE TRIGGER trg_shopping_sessions_updated_at
  BEFORE UPDATE ON public.shopping_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_shopping_session_items_updated_at
  BEFORE UPDATE ON public.shopping_session_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
