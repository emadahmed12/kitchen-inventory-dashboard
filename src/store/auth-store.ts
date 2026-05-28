"use client"

import { create } from "zustand"
import type { User } from "@supabase/supabase-js"
import type { DbProfile } from "@/lib/supabase/types"

type AuthState = {
  user: User | null
  profile: DbProfile | null
  isLoading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setProfile: (profile: DbProfile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true, // start as loading until we check the session
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearAuth: () => set({ user: null, profile: null, isLoading: false, error: null }),
}))

// Stable selectors
export const selectUser = (s: AuthState) => s.user
export const selectProfile = (s: AuthState) => s.profile
export const selectIsLoading = (s: AuthState) => s.isLoading
export const selectAuthError = (s: AuthState) => s.error
