/**
 * App-level layout — wraps all authenticated app routes with AppShell.
 * Auth pages (`/auth/*`) are siblings at the `[locale]` level and intentionally
 * do NOT use this layout (no sidebar, no topbar).
 */

"use client"

import { AppShell } from "@/components/layout/app-shell"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { SupabaseSyncProvider } from "@/components/providers/supabase-sync-provider"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseSyncProvider>
      {/* Column so the offline banner pushes the shell down instead of covering it */}
      <div className="flex h-dvh flex-col">
        <OfflineIndicator />
        <AppShell>{children}</AppShell>
      </div>
    </SupabaseSyncProvider>
  )
}
