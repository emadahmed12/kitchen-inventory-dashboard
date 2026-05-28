# Supabase Setup Guide

This guide sets up the production backend for the Kitchen Inventory Dashboard.
Without Supabase the app runs in **offline / dev mode** — no auth required, data
stored in localStorage.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project** and fill in the details.
3. Wait for the project to provision (~1–2 min).

---

## 2. Run the database schema

1. In the Supabase dashboard open **SQL Editor**.
2. Copy the entire contents of `supabase/migrations/001_schema.sql`.
3. Paste it into the editor and click **Run**.

This creates:
- `profiles` — user display names and avatars
- `inventory_items` — per-user inventory with RLS
- `activity_logs` — audit log for all changes
- `shopping_list_items` — persisted shopping list
- Row Level Security policies (users can only access their own data)
- A storage bucket for item images (`item-images`)
- Realtime enabled on `inventory_items` and `shopping_list_items`

---

## 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → service_role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

---

## 4. Enable Google OAuth (optional)

1. Go to **Authentication → Providers → Google**.
2. Toggle **Enable Google provider**.
3. Add your **Client ID** and **Client Secret** from
   [Google Cloud Console](https://console.cloud.google.com/).
4. Add the callback URL to your Google OAuth app's Authorized Redirect URIs:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```
5. Add your app's URL to **Authentication → URL Configuration**:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## 5. Deploy to Vercel

1. Push your code to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local` in the Vercel project settings.
4. Deploy.

---

## 6. Test the integration

- Visit `https://your-app.vercel.app` → should redirect to `/ar/auth/login`
- Sign up with email/password or Google
- After login → dashboard loads with your personal inventory
- Open the app in a second tab → changes sync in real time

---

## Architecture recap

```
Browser
  ├── Zustand store (optimistic client cache)
  │     └── persisted to localStorage (fallback / offline)
  │
  └── Server Actions (Next.js)
        ├── addItem → INSERT inventory_items
        ├── updateItem → UPDATE inventory_items
        ├── deleteItem → DELETE inventory_items
        └── fetchInventoryItems → SELECT inventory_items

Supabase
  ├── PostgreSQL (inventory data, RLS per user_id)
  ├── Auth (email/password + Google OAuth)
  ├── Storage (item images in `item-images` bucket)
  └── Realtime (Postgres changes → browser via websocket)
```

### Sync flow

1. User logs in → `useSupabaseSync` fetches all items and replaces Zustand store
2. New user → seed inventory is pushed to Supabase and stored per-user
3. Any mutation → Zustand updated immediately (optimistic) + Server Action fires in background
4. Server Action fails → Zustand rolled back, error toast shown
5. Another tab/device changes data → Realtime event updates Zustand store live

### Offline / dev mode

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to empty strings
(or leave them unset). The app will:
- Skip all auth checks
- Use Zustand + localStorage only
- Show seed inventory data
- No login page required
