-- ============================================================
-- Kitchen Inventory Dashboard — Supabase Schema
-- Run this in the Supabase SQL Editor or via `supabase db push`
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1.  PROFILES  (extends auth.users)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID    REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email           TEXT,
  display_name    TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- 2.  INVENTORY ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id                  UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name                TEXT    NOT NULL,
  quantity            INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit                TEXT    NOT NULL DEFAULT 'bag',
  category            TEXT    NOT NULL DEFAULT 'grains',
  location            TEXT    NOT NULL DEFAULT 'pantry',
  status              TEXT    NOT NULL DEFAULT 'healthy'
                              CHECK (status IN ('healthy','opened','low','almost_finished')),
  low_stock_threshold INTEGER NOT NULL DEFAULT 2 CHECK (low_stock_threshold >= 0),
  notes               TEXT,
  tags                TEXT[]  NOT NULL DEFAULT '{}',
  metadata            JSONB   NOT NULL DEFAULT '{}',
  image_url           TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_user_id ON public.inventory_items(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status  ON public.inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_updated ON public.inventory_items(updated_at DESC);

-- ────────────────────────────────────────────────────────────
-- 3.  ACTIVITY LOGS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id     UUID    REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  item_name   TEXT,   -- kept even if item is deleted
  action      TEXT    NOT NULL
              CHECK (action IN ('created','updated','deleted','quantity_increased','quantity_decreased')),
  changes     JSONB   NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id   ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created   ON public.activity_logs(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 4.  SHOPPING LIST ITEMS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shopping_list_items (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID    REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            TEXT    NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit            TEXT    DEFAULT 'bag',
  is_checked      BOOLEAN NOT NULL DEFAULT FALSE,
  source_item_id  UUID    REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON public.shopping_list_items(user_id);

-- ────────────────────────────────────────────────────────────
-- 5.  ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Inventory items
CREATE POLICY "items_select_own" ON public.inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "items_insert_own" ON public.inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "items_update_own" ON public.inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "items_delete_own" ON public.inventory_items FOR DELETE USING (auth.uid() = user_id);

-- Activity logs
CREATE POLICY "logs_select_own"  ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "logs_insert_own"  ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Shopping list
CREATE POLICY "shopping_all_own" ON public.shopping_list_items FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- 6.  TRIGGERS
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_inventory_items_updated_at
  BEFORE UPDATE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_shopping_list_updated_at
  BEFORE UPDATE ON public.shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 7.  STORAGE BUCKET  (item images)
-- ────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880,  -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "storage_item_images_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "storage_item_images_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'item-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_item_images_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'item-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "storage_item_images_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'item-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ────────────────────────────────────────────────────────────
-- 8.  REALTIME
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_list_items;
