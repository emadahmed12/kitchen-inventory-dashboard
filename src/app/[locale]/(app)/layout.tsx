/**
 * App-level layout — wraps all authenticated app routes with AppShell.
 * Auth pages (`/auth/*`) are siblings at the `[locale]` level and intentionally
 * do NOT use this layout (no sidebar, no topbar).
 */

"use client"

import { AppShell } from "@/components/layout/app-shell"
import { SupabaseSyncProvider } from "@/components/providers/supabase-sync-provider"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseSyncProvider>
      <AppShell>{children}</AppShell>
    </SupabaseSyncProvider>
  )
}
