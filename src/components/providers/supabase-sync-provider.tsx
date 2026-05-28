"use client"

import { useSupabaseSync } from "@/hooks/use-supabase-sync"

/**
 * Thin provider that activates Supabase data sync + realtime for all app routes.
 * Must be a client component since it runs hooks.
 */
export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  useSupabaseSync()
  return <>{children}</>
}
