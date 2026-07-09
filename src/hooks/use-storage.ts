"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useShallow } from "zustand/react/shallow"
import { toast } from "sonner"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import {
  fetchStorageLocations,
  createStorageLocation,
  updateStorageLocation,
  deleteStorageLocation,
  seedDefaultStorageLocations,
  moveItemsToLocation,
} from "@/lib/supabase/storage-actions"
import { useRealtimeStorage } from "@/lib/supabase/realtime"
import { useInventoryStore } from "@/store/inventory-store"
import {
  useStorageStore,
  selectStorageLocations,
  selectStorageLoaded,
} from "@/store/storage-store"
import { useAuth } from "@/hooks/use-auth"
import { STORAGE_LOCATIONS } from "@/data/catalog"
import type { StorageLocationInput, UserStorageLocation } from "@/types/storage"

/**
 * Bootstrap: loads storage locations from Supabase when the user is signed in.
 * Falls back to the static STORAGE_LOCATIONS catalog in dev / offline mode.
 * Seeds default locations on the user's first login.
 */
export function useStorageSync() {
  const { user } = useAuth()
  const { setLocations, addLocation, replaceLocation, deleteLocation: storeDelete } =
    useStorageStore(
      useShallow((s) => ({
        setLocations: s.setLocations,
        addLocation: s.addLocation,
        replaceLocation: s.replaceLocation,
        deleteLocation: s.deleteLocation,
      }))
    )
  const seededRef = useRef(false)

  useEffect(() => {
    if (!SUPABASE_ENABLED || !user) return

    async function load() {
      try {
        const dbLocations = await fetchStorageLocations()

        if (dbLocations.length === 0 && !seededRef.current) {
          seededRef.current = true
          // Seed default locations — pass translated names from catalog
          const seeded = await seedDefaultStorageLocations({
            kitchen: STORAGE_LOCATIONS.find((l) => l.id === "kitchen")?.label ?? "Kitchen",
            fridge:  STORAGE_LOCATIONS.find((l) => l.id === "fridge")?.label  ?? "Fridge",
            freezer: STORAGE_LOCATIONS.find((l) => l.id === "freezer")?.label ?? "Freezer",
            pantry:  STORAGE_LOCATIONS.find((l) => l.id === "pantry")?.label  ?? "Pantry",
          })
          setLocations(seeded)
        } else {
          setLocations(dbLocations)
        }
      } catch (err) {
        console.error("[storage] Failed to load storage locations", err)
      }
    }

    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Live sync across tabs/devices — new/edited/deleted locations appear instantly
  useRealtimeStorage(user?.id ?? null, {
    onInsert: addLocation,
    onUpdate: (location) => replaceLocation(location.id, location),
    onDelete: storeDelete,
  })

  return { addLocation, replaceLocation, storeDelete }
}

/**
 * Primary hook for reading and mutating storage locations.
 *
 * Returns the user's dynamic locations when Supabase is enabled,
 * or the static catalog locations in dev / offline mode.
 */
export function useStorageLocations() {
  const dbLocations = useStorageStore(selectStorageLocations)
  const isLoaded = useStorageStore(selectStorageLoaded)

  // In offline/dev mode fall back to static catalog
  if (!SUPABASE_ENABLED || !isLoaded) {
    return STORAGE_LOCATIONS.map(
      (l): UserStorageLocation => ({
        id: l.id,
        userId: "",
        name: l.label,
        type: "other",
        capacity: l.capacity,
        isDefault: true,
        createdAt: "",
        updatedAt: "",
      })
    )
  }

  return dbLocations
}

/** Async CRUD actions wired to optimistic Zustand updates + Supabase Server Actions. */
export function useStorageActions() {
  const { addLocation, replaceLocation } = useStorageStore(
    useShallow((s) => ({
      addLocation: s.addLocation,
      replaceLocation: s.replaceLocation,
      deleteLocation: s.deleteLocation,
    }))
  )
  const storeDeleteLocation = useStorageStore((s) => s.deleteLocation)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const create = useCallback(
    async (input: StorageLocationInput): Promise<UserStorageLocation | null> => {
      if (!SUPABASE_ENABLED) {
        toast.error("Cloud storage is not configured.")
        return null
      }
      setIsSaving(true)
      try {
        const location = await createStorageLocation(input)
        addLocation(location)
        return location
      } catch {
        toast.error("Failed to create storage location.")
        return null
      } finally {
        setIsSaving(false)
      }
    },
    [addLocation]
  )

  const update = useCallback(
    async (id: string, input: StorageLocationInput): Promise<boolean> => {
      if (!SUPABASE_ENABLED) return false
      setIsSaving(true)
      try {
        const location = await updateStorageLocation(id, input)
        replaceLocation(id, location)
        return true
      } catch {
        toast.error("Failed to update storage location.")
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [replaceLocation]
  )

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!SUPABASE_ENABLED) return false
      setIsDeleting(true)
      try {
        await deleteStorageLocation(id)
        storeDeleteLocation(id)
        return true
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : ""
        if (msg.startsWith("LOCATION_HAS_ITEMS:")) {
          const count = msg.split(":")[1]
          toast.error(`Cannot delete — ${count} item(s) are stored here. Move them first.`)
        } else {
          toast.error("Failed to delete storage location.")
        }
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [storeDeleteLocation]
  )

  /**
   * Move items to another location.
   * Optimistic: the Zustand store updates immediately; if the Supabase
   * write fails the previous locations are restored per item.
   */
  const moveItems = useCallback(
    async (itemIds: string[], targetLocationId: string): Promise<boolean> => {
      if (itemIds.length === 0) return false

      // Snapshot previous locations for rollback
      const previous = new Map(
        useInventoryStore
          .getState()
          .items.filter((i) => itemIds.includes(i.id))
          .map((i) => [i.id, i.location])
      )

      useInventoryStore.getState().moveItems(itemIds, targetLocationId)

      if (SUPABASE_ENABLED) {
        try {
          await moveItemsToLocation(itemIds, targetLocationId)
        } catch {
          // Rollback each item to its original location
          const { moveItems: storeMove } = useInventoryStore.getState()
          for (const [id, loc] of previous) storeMove([id], loc)
          toast.error("Failed to move items.")
          return false
        }
      }
      return true
    },
    []
  )

  return { create, update, remove, moveItems, isSaving, isDeleting }
}
