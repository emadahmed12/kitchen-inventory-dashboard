"use client"

import { useEffect } from "react"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/client"
import {
  useAuthStore,
  selectUser,
  selectProfile,
  selectIsLoading,
  selectAuthError,
} from "@/store/auth-store"

/**
 * Initialises the auth state and subscribes to Supabase auth changes.
 * Call this ONCE at the top of the component tree (e.g. in the root layout
 * or an AuthProvider component).
 *
 * In dev/offline mode (no Supabase) it immediately clears the loading state.
 */
export function useAuthInit() {
  const { setUser, setProfile, setLoading, setError, clearAuth } = useAuthStore()

  useEffect(() => {
    if (!SUPABASE_ENABLED) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    // 1. Get the current session on mount
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setUser(user)
      setLoading(false)

      // Fetch profile if user is logged in
      if (user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setProfile(data)
          })
      }
    })

    // 2. Subscribe to auth state changes (login / logout / token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        clearAuth()
      }
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

/** Read-only hook for consuming auth state. */
export function useAuth() {
  const user = useAuthStore(selectUser)
  const profile = useAuthStore(selectProfile)
  const isLoading = useAuthStore(selectIsLoading)
  const error = useAuthStore(selectAuthError)

  return { user, profile, isLoading, error }
}

/** Sign out the current user. */
export async function signOut() {
  if (!SUPABASE_ENABLED) return
  const supabase = createClient()
  await supabase.auth.signOut()
}
