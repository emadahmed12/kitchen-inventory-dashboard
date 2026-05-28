import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config"
import type { Database } from "./types"

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Uses the cookie store for session management.
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // In Server Components the cookie store is read-only.
          // The middleware handles refreshing expired sessions.
        }
      },
    },
  })
}
