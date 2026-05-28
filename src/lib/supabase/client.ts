"use client"

import { createBrowserClient } from "@supabase/ssr"
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ENABLED } from "./config"
import type { Database } from "./types"

/**
 * A singleton browser Supabase client.
 * Safe to call multiple times — returns the same instance.
 * Throws in dev mode so callers must gate with SUPABASE_ENABLED.
 */
export function createClient() {
  if (!SUPABASE_ENABLED) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    )
  }
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
