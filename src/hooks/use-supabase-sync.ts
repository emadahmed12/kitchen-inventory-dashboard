"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import { fetchInventoryItems, serverSeedItems } from "@/lib/supabase/actions"
import { useRealtimeInventory } from "@/lib/supabase/realtime"
import { useAuth } from "@/hooks/use-auth"
import { useInventoryStore } from "@/store/inventory-store"

/**
 * Bootstraps Supabase sync for the authenticated user:
 *
 * 1. On login  → fetch all items from DB and replace the Zustand store
 * 2. New user  → seed the DB with the app's default inventory
 * 3. Realtime  → subscribe to Postgres changes so other tabs/devices sync live
 *
 * No-op in dev/offline mode.
 */
export function useSupabaseSync() {
  const { user } = useAuth()
  const seededRef = useRef(false)
  const { setItems, replaceItem, addItemToStore, deleteItemFromStore } =
    useInventoryStore()

  // ── initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!SUPABASE_ENABLED || !user) return

    async function loadItems() {
      try {
        const dbItems = await fetchInventoryItems()

        if (dbItems.length === 0 && !seededRef.current) {
          // New user — seed with the app's default SEED_INVENTORY
          seededRef.current = true
          const { SEED_INVENTORY } = await import("@/data/seed-inventory")
          const seeded = await serverSeedItems(
            SEED_INVENTORY.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              location: item.location,
              status: item.status,
              lowStockThreshold: item.lowStockThreshold,
              notes: item.notes,
              tags: item.tags,
              metadata: item.metadata,
            }))
          )
          setItems(seeded)
        } else {
          setItems(dbItems)
        }
      } catch (err) {
        console.error("Failed to load inventory from Supabase:", err)
        // Keep local items as fallback
      }
    }

    loadItems()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // ── realtime ───────────────────────────────────────────────────────────────
  useRealtimeInventory(user?.id ?? null, {
    onInsert: (item) => {
      // Avoid duplicate if the optimistic item is already in the store
      addItemToStore(item)
    },
    onUpdate: (item) => {
      replaceItem(item.id, item)
    },
    onDelete: (id) => {
      deleteItemFromStore(id)
      toast.info("Item deleted from another device")
    },
  })
}
