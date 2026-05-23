"use client"

import { useEffect } from "react"
import { useShallow } from "zustand/react/shallow"

import { getInitialInventoryItems } from "@/lib/inventory/migrate"
import {
  selectFilteredItems,
  selectHasActiveFilters,
  selectHydrated,
  selectStats,
  useInventoryStore,
} from "@/store/inventory-store"

/** Primary hook — inventory list, filters, CRUD */
export function useInventory() {
  const store = useInventoryStore(
    useShallow((s) => ({
      items: s.items,
      hydrated: s._hasHydrated,
      filters: s.filters,
      view: s.viewMode,
      search: s.filters.search,
      category: s.filters.category,
      status: s.filters.status,
      sort: s.filters.sort,
      setSearch: s.setSearch,
      setCategory: s.setCategory,
      setStatus: s.setStatus,
      setSort: s.setSort,
      setViewMode: s.setViewMode,
      clearFilters: s.clearFilters,
      addItem: s.addItem,
      updateItem: s.updateItem,
      deleteItem: s.deleteItem,
      updateQuantity: s.updateQuantity,
    }))
  )

  const filteredItems = useInventoryStore(selectFilteredItems)
  const stats = useInventoryStore(selectStats)
  const hasActiveFilters = useInventoryStore(selectHasActiveFilters)

  useEffect(() => {
    const finish = useInventoryStore.persist.onFinishHydration(() => {
      const state = useInventoryStore.getState()
      if (state.items.length === 0) {
        useInventoryStore.setState({ items: getInitialInventoryItems() })
      }
      state.setHasHydrated(true)
    })
    void useInventoryStore.persist.rehydrate()
    return finish
  }, [])

  return {
    ...store,
    filteredItems,
    stats,
    hasActiveFilters,
  }
}

/** Read-only access to all items (dashboard, command palette) */
export function useInventoryItems() {
  return useInventoryStore((s) => s.items)
}

export function useInventoryHydrated() {
  return useInventoryStore(selectHydrated)
}
