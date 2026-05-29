"use client"

import { useEffect, useRef } from "react"
import { useSupabaseSync } from "@/hooks/use-supabase-sync"
import { useAuthInit } from "@/hooks/use-auth"
import { useStorageSync } from "@/hooks/use-storage"

/**
 * Initialises auth + Supabase sync for all app routes.
 * Kept here (not in Topbar) so auth state is ready before any component renders,
 * and so Topbar does not subscribe to auth store changes and re-render AppShell.
 */
export function SupabaseSyncProvider({ children }: { children: React.ReactNode }) {
  // DEBUG: detect render loops — counted in effect (safe, no ref read during render)
  const renderCount = useRef(0)
  useEffect(() => {
    renderCount.current++
    if (renderCount.current > 10) {
      console.error(`[kitchen] SupabaseSyncProvider render loop — ${renderCount.current} renders`)
    } else {
      console.debug(`[kitchen] SupabaseSyncProvider mount/update #${renderCount.current}`)
    }
  })

  useAuthInit()
  useSupabaseSync()
  useStorageSync()
  return <>{children}</>
}
