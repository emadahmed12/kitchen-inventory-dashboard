"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { generateInventoryId } from "@/lib/inventory/id"
import type {
  ShoppingItemState,
  ShoppingListItem,
  ShoppingSession,
  ShoppingSessionItem,
} from "@/types/shopping"

type ShoppingState = {
  /** Pre-session queue — items the user wants to buy. */
  listItems: ShoppingListItem[]
  /** The running session. Persisted so it survives a page refresh mid-shop. */
  session: ShoppingSession | null
  /** Completed sessions stored locally for history. */
  history: ShoppingSession[]

  // ── list actions ──────────────────────────────────────────
  addToList: (item: Omit<ShoppingListItem, "id">) => void
  removeFromList: (id: string) => void
  updateListItemQty: (id: string, qty: number) => void
  clearList: () => void
  /** Remove auto-detected items (re-sync with current inventory). */
  replaceAutoDetected: (items: Omit<ShoppingListItem, "id">[]) => void

  // ── session actions ───────────────────────────────────────
  startSession: () => void
  addManualItem: (name: string, unit: string, qty: number) => void
  setBoughtQty: (itemId: string, qty: number) => void
  setItemState: (itemId: string, state: ShoppingItemState) => void
  markAllPurchased: () => void
  finishSession: () => void
  cancelSession: () => void
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set, get) => ({
      listItems: [],
      session: null,
      history: [],

      // ── list ─────────────────────────────────────────────
      addToList: (item) => {
        const id = generateInventoryId()
        set((s) => {
          // Avoid duplicates by inventoryItemId
          if (item.inventoryItemId && s.listItems.some((l) => l.inventoryItemId === item.inventoryItemId)) {
            return s
          }
          return { listItems: [...s.listItems, { ...item, id }] }
        })
      },

      removeFromList: (id) =>
        set((s) => ({ listItems: s.listItems.filter((l) => l.id !== id) })),

      updateListItemQty: (id, qty) =>
        set((s) => ({
          listItems: s.listItems.map((l) =>
            l.id === id ? { ...l, neededQty: Math.max(1, qty) } : l
          ),
        })),

      clearList: () => set({ listItems: [] }),

      replaceAutoDetected: (items) =>
        set((s) => {
          const manual = s.listItems.filter((l) => !l.isAutoDetected)
          const withIds = items.map((i) => ({ ...i, id: generateInventoryId() }))
          // Keep manual items; replace auto-detected
          const merged = [...manual]
          for (const item of withIds) {
            if (!merged.some((m) => m.inventoryItemId === item.inventoryItemId)) {
              merged.push(item)
            }
          }
          return { listItems: merged }
        }),

      // ── session ───────────────────────────────────────────
      startSession: () => {
        const { listItems, session } = get()
        if (session?.status === "active") return // already active
        if (listItems.length === 0) return

        const sessionItems: ShoppingSessionItem[] = listItems.map((l, i) => ({
          id: generateInventoryId(),
          inventoryItemId: l.inventoryItemId,
          name: l.name,
          unit: l.unit,
          neededQty: l.neededQty,
          boughtQty: 0,
          currentStock: l.currentStock,
          state: "pending" as const,
          sortOrder: i,
        }))

        set({
          session: {
            id: generateInventoryId(),
            status: "active",
            startedAt: new Date().toISOString(),
            items: sessionItems,
          },
        })
      },

      addManualItem: (name, unit, qty) => {
        set((s) => {
          if (!s.session) return s
          const newItem: ShoppingSessionItem = {
            id: generateInventoryId(),
            name,
            unit,
            neededQty: qty,
            boughtQty: 0,
            currentStock: 0,
            state: "pending",
            sortOrder: s.session.items.length,
          }
          return {
            session: {
              ...s.session,
              items: [...s.session.items, newItem],
            },
          }
        })
      },

      setBoughtQty: (itemId, qty) => {
        set((s) => {
          if (!s.session) return s
          return {
            session: {
              ...s.session,
              items: s.session.items.map((item) => {
                if (item.id !== itemId) return item
                const clampedQty = Math.max(0, qty)
                const state: ShoppingItemState =
                  clampedQty === 0
                    ? "pending"
                    : clampedQty >= item.neededQty
                      ? "purchased"
                      : "partial"
                return { ...item, boughtQty: clampedQty, state }
              }),
            },
          }
        })
      },

      setItemState: (itemId, state) => {
        set((s) => {
          if (!s.session) return s
          return {
            session: {
              ...s.session,
              items: s.session.items.map((item) => {
                if (item.id !== itemId) return item
                const boughtQty =
                  state === "purchased"
                    ? item.neededQty
                    : state === "skipped" || state === "pending"
                      ? 0
                      : item.boughtQty
                return { ...item, state, boughtQty }
              }),
            },
          }
        })
      },

      markAllPurchased: () => {
        set((s) => {
          if (!s.session) return s
          return {
            session: {
              ...s.session,
              items: s.session.items.map((item) =>
                item.state === "skipped"
                  ? item
                  : { ...item, state: "purchased" as const, boughtQty: item.neededQty }
              ),
            },
          }
        })
      },

      finishSession: () => {
        set((s) => {
          if (!s.session) return s
          const completed: ShoppingSession = {
            ...s.session,
            status: "completed",
            completedAt: new Date().toISOString(),
          }
          return {
            session: null,
            // Clear list since the session consumed it
            listItems: [],
            history: [completed, ...s.history].slice(0, 20), // keep last 20
          }
        })
      },

      cancelSession: () => {
        set((s) => {
          if (!s.session) return s
          return {
            session: null,
            // Restore list items from session (so user doesn't lose them)
            listItems: s.session.items.map((item) => ({
              id: generateInventoryId(),
              inventoryItemId: item.inventoryItemId,
              name: item.name,
              unit: item.unit,
              neededQty: item.neededQty,
              currentStock: item.currentStock,
              isAutoDetected: false,
            })),
          }
        })
      },
    }),
    {
      name: "kitchen-shopping",
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Stable selectors
export const selectShoppingList = (s: ShoppingState) => s.listItems
export const selectShoppingSession = (s: ShoppingState) => s.session
export const selectShoppingHistory = (s: ShoppingState) => s.history
