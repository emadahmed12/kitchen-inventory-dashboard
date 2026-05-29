"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { UserStorageLocation } from "@/types/storage"

type StorageState = {
  locations: UserStorageLocation[]
  _isLoaded: boolean

  /** Replace the entire list (called after fetching from Supabase). */
  setLocations: (locations: UserStorageLocation[]) => void
  /** Add a single location (optimistic insert or realtime insert). */
  addLocation: (location: UserStorageLocation) => void
  /** Swap a location by id (optimistic-to-confirmed or realtime update). */
  replaceLocation: (id: string, location: UserStorageLocation) => void
  /** Remove a location by id. */
  deleteLocation: (id: string) => void
  setLoaded: (loaded: boolean) => void
}

export const useStorageStore = create<StorageState>()(
  persist(
    (set) => ({
      locations: [],
      _isLoaded: false,

      setLocations: (locations) => set({ locations, _isLoaded: true }),

      addLocation: (location) =>
        set((s) => ({
          locations: s.locations.some((l) => l.id === location.id)
            ? s.locations
            : [...s.locations, location],
        })),

      replaceLocation: (id, location) =>
        set((s) => ({
          locations: s.locations.map((l) => (l.id === id ? location : l)),
        })),

      deleteLocation: (id) =>
        set((s) => ({
          locations: s.locations.filter((l) => l.id !== id),
        })),

      setLoaded: (loaded) => set({ _isLoaded: loaded }),
    }),
    {
      name: "kitchen-storage-locations",
      storage: createJSONStorage(() => localStorage),
      // Only persist the locations array (not the loaded flag)
      partialize: (s) => ({ locations: s.locations }),
    }
  )
)

export function selectStorageLocations(s: StorageState) {
  return s.locations
}
export function selectStorageLoaded(s: StorageState) {
  return s._isLoaded
}
