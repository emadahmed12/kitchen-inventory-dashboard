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
} from "@/types/inventory"
import type { InventoryFilterState, SortOption, StatusFilter, ViewMode } from "@/types/ui"

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
  setStatus: (status: StatusFilter) => void
  setSort: (sort: SortOption) => void
  setViewMode: (view: ViewMode) => void
  clearFilters: () => void

  // Local-only mutations (optimistic cache)
  addItem: (input: InventoryItemInput) => InventoryItem
  updateItem: (id: string, input: InventoryItemInput) => void
  deleteItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  /** Reassign a batch of items to a new storage location. */
  moveItems: (ids: string[], locationId: string) => void
  resetToSeed: () => void

  // Supabase sync helpers
  /** Replace the entire items array (used after fetching from Supabase). */
  setItems: (items: InventoryItem[]) => void
  /** Swap an optimistic item with the DB-confirmed version (resolves temp ID). */
  replaceItem: (id: string, item: InventoryItem) => void
  /** Add a single item without creating a new one (used by realtime inserts). */
  addItemToStore: (item: InventoryItem) => void
  /** Remove a single item by ID (used by realtime deletes). */
  deleteItemFromStore: (id: string) => void
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

      moveItems: (ids, locationId) => {
        const idSet = new Set(ids)
        set((s) => ({
          items: s.items.map((item) =>
            idSet.has(item.id)
              ? { ...item, location: locationId, updatedAt: new Date().toISOString() }
              : item
          ),
        }))
        notifyInventoryChange()
      },

      resetToSeed: () => {
        set({ items: SEED_INVENTORY, filters: DEFAULT_FILTERS })
        notifyInventoryChange()
      },

      // ── Supabase sync helpers ────────────────────────────────────────────
      setItems: (items) => {
        set({ items })
        notifyInventoryChange()
      },

      replaceItem: (id, newItem) => {
        set((s) => ({
          items: s.items.some((i) => i.id === id)
            ? s.items.map((i) => (i.id === id ? newItem : i))
            : s.items, // item already gone (delete race) — no-op
        }))
        notifyInventoryChange()
      },

      addItemToStore: (item) => {
        set((s) => {
          // Skip if item is already in the store (optimistic duplicate)
          if (s.items.some((i) => i.id === item.id)) return s
          return { items: [item, ...s.items] }
        })
        notifyInventoryChange()
      },

      deleteItemFromStore: (id) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
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
        if (!hydratedState || hydratedState.items.length === 0) {
          useInventoryStore.setState({ items: getInitialInventoryItems() })
        }
        useInventoryStore.setState({ _hasHydrated: true })
      },
    }
  )
)

/**
 * Stable selectors — each returns a primitive or the exact state reference.
 */
export function selectAllItems(s: InventoryState) { return s.items }
export function selectFilters(s: InventoryState) { return s.filters }
export function selectHydrated(s: InventoryState) { return s._hasHydrated }
export function selectHasActiveFilters(s: InventoryState) { return hasActiveFilters(s.filters) }
export function selectViewMode(s: InventoryState) { return s.viewMode }
