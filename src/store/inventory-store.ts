"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { SEED_INVENTORY } from "@/data/seed-inventory"
import { hasActiveFilters } from "@/lib/inventory/filters"
import { STORE_STORAGE_KEY } from "@/lib/inventory/constants"
import { getInitialInventoryItems } from "@/lib/inventory/migrate"
import {
  createInventoryItem,
  mergeInventoryItem,
} from "@/lib/inventory/normalize"
import { statusAfterQuantityChange } from "@/lib/inventory/status"
import type { CategoryId } from "@/types/catalog"
import type {
  InventoryItem,
  InventoryItemInput,
  InventoryStatus,
} from "@/types/inventory"
import type { InventoryFilterState, SortOption, ViewMode } from "@/types/ui"

const DEFAULT_FILTERS: InventoryFilterState = {
  search: "",
  category: "all",
  status: "all",
  sort: "status",
}

function notifyInventoryChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("inventory-updated"))
  }
}

type InventoryState = {
  items: InventoryItem[]
  _hasHydrated: boolean
  filters: InventoryFilterState
  viewMode: ViewMode

  setHasHydrated: (value: boolean) => void
  setSearch: (search: string) => void
  setCategory: (category: CategoryId | "all") => void
  setStatus: (status: InventoryStatus | "all") => void
  setSort: (sort: SortOption) => void
  setViewMode: (view: ViewMode) => void
  clearFilters: () => void

  addItem: (input: InventoryItemInput) => InventoryItem
  updateItem: (id: string, input: InventoryItemInput) => void
  deleteItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void

  resetToSeed: () => void
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      items: SEED_INVENTORY,
      _hasHydrated: false,
      filters: DEFAULT_FILTERS,
      viewMode: "grid",

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setSearch: (search) =>
        set((s) => ({ filters: { ...s.filters, search } })),

      setCategory: (category) =>
        set((s) => ({ filters: { ...s.filters, category } })),

      setStatus: (status) =>
        set((s) => ({ filters: { ...s.filters, status } })),

      setSort: (sort) =>
        set((s) => ({ filters: { ...s.filters, sort } })),

      setViewMode: (viewMode) => set({ viewMode }),

      clearFilters: () => set({ filters: DEFAULT_FILTERS }),

      addItem: (input) => {
        const item = createInventoryItem(input)
        set((s) => ({ items: [item, ...s.items] }))
        notifyInventoryChange()
        return item
      },

      updateItem: (id, input) => {
        set((s) => ({
          items: s.items.map((item) =>
            item.id === id ? mergeInventoryItem(item, input) : item
          ),
        }))
        notifyInventoryChange()
      },

      deleteItem: (id) => {
        set((s) => ({ items: s.items.filter((item) => item.id !== id) }))
        notifyInventoryChange()
      },

      updateQuantity: (id, quantity) => {
        const next = Math.max(1, quantity)
        set((s) => ({
          items: s.items.map((item) => {
            if (item.id !== id) return item
            const status = statusAfterQuantityChange(item, next)
            return {
              ...item,
              quantity: next,
              status,
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
        notifyInventoryChange()
      },

      resetToSeed: () => {
        set({ items: SEED_INVENTORY, filters: DEFAULT_FILTERS })
        notifyInventoryChange()
      },
    }),
    {
      name: STORE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        viewMode: state.viewMode,
      }),
      onRehydrateStorage: () => (hydratedState) => {
        // hydratedState is undefined if storage was empty or a parse error occurred.
        // In either case, ensure seed data + mark hydration complete.
        if (!hydratedState || hydratedState.items.length === 0) {
          useInventoryStore.setState({ items: getInitialInventoryItems() })
        }
        // Use setState directly — avoids the circular-reference race that can
        // silently drop the callback in minified production bundles.
        useInventoryStore.setState({ _hasHydrated: true })
      },
    }
  )
)

/**
 * Stable selectors — each returns a primitive or the exact state reference.
 * React 19 / useSyncExternalStore requires getServerSnapshot to return the
 * same reference across calls; these never construct new objects/arrays so
 * they satisfy that contract and never trigger spurious re-renders.
 *
 * Do NOT add selectors here that call filter/map/sort or construct new
 * objects. Put those computations in useMemo inside the consuming hook.
 */

/** The raw items array — same reference until an item is added/edited/deleted */
export function selectAllItems(s: InventoryState) {
  return s.items
}

/** The filters object — same reference until a filter value changes */
export function selectFilters(s: InventoryState) {
  return s.filters
}

/** Boolean primitive — always stable */
export function selectHydrated(s: InventoryState) {
  return s._hasHydrated
}

/** Boolean primitive — always stable */
export function selectHasActiveFilters(s: InventoryState) {
  return hasActiveFilters(s.filters)
}

/** String primitive — always stable */
export function selectViewMode(s: InventoryState) {
  return s.viewMode
}
