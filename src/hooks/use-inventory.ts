"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { useShallow } from "zustand/react/shallow"
import { toast } from "sonner"

import { filterAndSortItems, hasActiveFilters } from "@/lib/inventory/filters"
import { computeInventoryStats } from "@/lib/inventory/stats"
import {
  selectAllItems,
  selectFilters,
  selectHydrated,
  selectViewMode,
  useInventoryStore,
} from "@/store/inventory-store"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import {
  serverAddItem,
  serverUpdateItem,
  serverUpdateQuantity,
  serverDeleteItem,
} from "@/lib/supabase/actions"
import type { InventoryItemInput } from "@/types/inventory"

/**
 * Primary inventory hook.
 *
 * All mutation actions use **optimistic updates**:
 *  1. Zustand store is updated immediately → UI reflects change at once
 *  2. Server Action syncs with Supabase in the background
 *  3. On DB success → the optimistic item is swapped for the DB-confirmed one
 *  4. On DB failure → the optimistic change is rolled back and a toast is shown
 *
 * When SUPABASE_ENABLED is false the actions behave exactly as before
 * (pure Zustand / localStorage).
 */
export function useInventory() {
  const items = useInventoryStore(selectAllItems)
  const filters = useInventoryStore(selectFilters)
  const hydrated = useInventoryStore(selectHydrated)
  const viewMode = useInventoryStore(selectViewMode)

  const storeActions = useInventoryStore(
    useShallow((s) => ({
      setSearch: s.setSearch,
      setCategory: s.setCategory,
      setStatus: s.setStatus,
      setSort: s.setSort,
      setViewMode: s.setViewMode,
      clearFilters: s.clearFilters,
      // raw store mutations (optimistic)
      _addItem: s.addItem,
      _updateItem: s.updateItem,
      _deleteItem: s.deleteItem,
      _updateQuantity: s.updateQuantity,
      _replaceItem: s.replaceItem,
    }))
  )

  // ── synced mutations ──────────────────────────────────────────────────────

  const addItem = useCallback(
    (input: InventoryItemInput) => {
      const optimistic = storeActions._addItem(input)

      if (SUPABASE_ENABLED) {
        serverAddItem(input)
          .then((dbItem) => storeActions._replaceItem(optimistic.id, dbItem))
          .catch(() => {
            storeActions._deleteItem(optimistic.id)
            toast.error("Sync failed — item was not saved to the cloud.")
          })
      }

      return optimistic
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeActions._addItem, storeActions._deleteItem, storeActions._replaceItem]
  )

  const updateItem = useCallback(
    (id: string, input: InventoryItemInput) => {
      // Store the previous state for rollback
      const previous = useInventoryStore.getState().items.find((i) => i.id === id)
      storeActions._updateItem(id, input)

      if (SUPABASE_ENABLED) {
        serverUpdateItem(id, input)
          .then((dbItem) => storeActions._replaceItem(id, dbItem))
          .catch(() => {
            if (previous) storeActions._replaceItem(id, previous)
            toast.error("Sync failed — changes were not saved to the cloud.")
          })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeActions._updateItem, storeActions._replaceItem]
  )

  const deleteItem = useCallback(
    (id: string) => {
      const previous = useInventoryStore.getState().items.find((i) => i.id === id)
      storeActions._deleteItem(id)

      if (SUPABASE_ENABLED && previous) {
        serverDeleteItem(id, previous.name).catch(() => {
          // Re-add the item on failure
          storeActions._replaceItem(id, previous) // won't match so it's a no-op
          useInventoryStore.setState((s) => ({
            items: [...s.items, previous],
          }))
          toast.error("Sync failed — item was not deleted from the cloud.")
        })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeActions._deleteItem, storeActions._replaceItem]
  )

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      const previous = useInventoryStore.getState().items.find((i) => i.id === id)
      storeActions._updateQuantity(id, quantity)

      if (SUPABASE_ENABLED && previous) {
        serverUpdateQuantity(id, quantity, previous.quantity)
          .then((dbItem) => storeActions._replaceItem(id, dbItem))
          .catch(() => {
            if (previous) storeActions._replaceItem(id, previous)
          })
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [storeActions._updateQuantity, storeActions._replaceItem]
  )

  // ── derived values ────────────────────────────────────────────────────────
  const filteredItems = useMemo(
    () => filterAndSortItems(items, filters),
    [items, filters]
  )
  const stats = useMemo(() => computeInventoryStats(items), [items])
  const activeFilters = useMemo(() => hasActiveFilters(filters), [filters])

  return {
    items,
    hydrated,
    filters,
    view: viewMode,
    search: filters.search,
    category: filters.category,
    status: filters.status,
    sort: filters.sort,
    filteredItems,
    stats,
    hasActiveFilters: activeFilters,
    // filter actions
    setSearch: storeActions.setSearch,
    setCategory: storeActions.setCategory,
    setStatus: storeActions.setStatus,
    setSort: storeActions.setSort,
    setViewMode: storeActions.setViewMode,
    clearFilters: storeActions.clearFilters,
    // synced mutations
    addItem,
    updateItem,
    deleteItem,
    updateQuantity,
  }
}

export function useInventoryItems() {
  return useInventoryStore(selectAllItems)
}

/**
 * Reliable hydration check (two-layer fallback).
 */
export function useInventoryHydrated() {
  const storeHydrated = useInventoryStore(selectHydrated)
  const [persistReady, setPersistReady] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (useInventoryStore.persist.hasHydrated()) {
      setPersistReady(true)
      return
    }
    return useInventoryStore.persist.onFinishHydration(() => {
      setPersistReady(true)
    })
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  return storeHydrated || persistReady
}
