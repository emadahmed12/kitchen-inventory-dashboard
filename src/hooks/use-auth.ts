"use client"

import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/store/auth-store"

/**
 * Initialises the auth state and subscribes to Supabase auth changes.
 * Call this ONCE at the top of the component tree (e.g. in the root layout
 * or an AuthProvider component).
 *
 * In dev/offline mode (no Supabase) it immediately clears the loading state.
 */
export function useAuthInit() {
  // Use getState() for actions — they're stable references, no selector subscription needed
  // This prevents Topbar from subscribing to the auth store and re-rendering on auth changes
  const { setUser, setProfile, setLoading, setError, clearAuth } = useAuthStore.getState()

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

/**
 * Read-only hook for consuming auth state.
 * useShallow prevents re-renders when unrelated auth fields change
 * (e.g. isLoading flip no longer re-renders SupabaseSyncProvider).
 */
export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      profile: s.profile,
      isLoading: s.isLoading,
      error: s.error,
    }))
  )
}

/** Sign out the current user. */
export async function signOut() {
  if (!SUPABASE_ENABLED) return
  const supabase = createClient()
  await supabase.auth.signOut()
}
