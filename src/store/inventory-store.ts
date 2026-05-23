"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { SEED_INVENTORY } from "@/data/seed-inventory"
import {
  filterAndSortItems,
  hasActiveFilters,
} from "@/lib/inventory/filters"
import { STORE_STORAGE_KEY } from "@/lib/inventory/constants"
import { getInitialInventoryItems } from "@/lib/inventory/migrate"
import {
  createInventoryItem,
  mergeInventoryItem,
} from "@/lib/inventory/normalize"
import { computeInventoryStats } from "@/lib/inventory/stats"
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
    (set, get) => ({
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
      onRehydrateStorage: () => () => {
        const current = useInventoryStore.getState()
        if (current.items.length === 0) {
          useInventoryStore.setState({ items: getInitialInventoryItems() })
        }
        useInventoryStore.getState().setHasHydrated(true)
      },
    }
  )
)

/** Selectors — use in hooks or components */

export function selectAllItems(state: InventoryState) {
  return state.items
}

export function selectFilteredItems(state: InventoryState) {
  return filterAndSortItems(state.items, state.filters)
}

export function selectStats(state: InventoryState) {
  return computeInventoryStats(state.items)
}

export function selectHydrated(state: InventoryState) {
  return state._hasHydrated
}

export function selectFilters(state: InventoryState) {
  return state.filters
}

export function selectHasActiveFilters(state: InventoryState) {
  return hasActiveFilters(state.filters)
}
