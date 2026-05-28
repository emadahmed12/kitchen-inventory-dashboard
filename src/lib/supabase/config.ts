/**
 * Supabase runtime configuration.
 *
 * SUPABASE_ENABLED === false → the app runs in "dev / offline" mode:
 *   - No authentication required
 *   - Zustand + localStorage for persistence (existing behaviour)
 *   - All Supabase imports are safe to import but are no-ops
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

/** True when both vars are present and not empty placeholder strings. */
export const SUPABASE_ENABLED = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== "your-supabase-url" &&
    SUPABASE_ANON_KEY !== "your-supabase-anon-key"
)
