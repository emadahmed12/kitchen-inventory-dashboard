"use client"

import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"

import { filterAndSortItems, hasActiveFilters } from "@/lib/inventory/filters"
import { computeInventoryStats } from "@/lib/inventory/stats"
import {
  selectAllItems,
  selectFilters,
  selectHydrated,
  selectViewMode,
  useInventoryStore,
} from "@/store/inventory-store"

/**
 * Primary inventory hook.
 *
 * Architecture note — why selectors are split from derived values:
 *
 * React 19 uses useSyncExternalStore internally (via Zustand 5). That API
 * requires getServerSnapshot to return a cached/stable reference on every
 * call. Selectors that compute new arrays or objects (filter, sort, map)
 * violate this contract: each call returns a new reference, React detects
 * the mismatch, and triggers an infinite render loop.
 *
 * Fix: selectors passed to useInventoryStore only return raw state slices
 * (items, filters, booleans). Derived values are computed in useMemo, which
 * is stable by design — it only recomputes when its declared deps change.
 */
export function useInventory() {
  // --- Raw state subscriptions (stable references) ---

  // items: same array reference until an item is added/updated/deleted
  const items = useInventoryStore(selectAllItems)

  // filters: same object reference until a filter value changes
  const filters = useInventoryStore(selectFilters)

  const hydrated = useInventoryStore(selectHydrated)
  const viewMode = useInventoryStore(selectViewMode)

  // Actions — Zustand creates these once at store initialisation and never
  // replaces them, so each function reference is permanently stable.
  // useShallow groups them into one subscription to avoid 10 separate ones.
  const actions = useInventoryStore(
    useShallow((s) => ({
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

  // --- Derived values (computed once per dependency change) ---

  // filteredItems: recomputed only when items array or filters object change
  const filteredItems = useMemo(
    () => filterAndSortItems(items, filters),
    [items, filters]
  )

  // stats: recomputed only when items array changes
  const stats = useMemo(() => computeInventoryStats(items), [items])

  // hasActiveFilters: recomputed only when filters object changes
  const activeFilters = useMemo(() => hasActiveFilters(filters), [filters])

  return {
    // Raw
    items,
    hydrated,
    filters,
    view: viewMode,
    // Convenience aliases so consumers don't need to destructure filters
    search: filters.search,
    category: filters.category,
    status: filters.status,
    sort: filters.sort,
    // Derived
    filteredItems,
    stats,
    hasActiveFilters: activeFilters,
    // Actions
    ...actions,
  }
}

/**
 * Lightweight read-only hook for components that only need the raw item list
 * (dashboard, command palette, topbar alerts).
 * Returns the same array reference until items mutate — safe for useMemo deps.
 */
export function useInventoryItems() {
  return useInventoryStore(selectAllItems)
}

export function useInventoryHydrated() {
  return useInventoryStore(selectHydrated)
}
