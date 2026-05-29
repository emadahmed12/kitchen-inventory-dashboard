"use client"

import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"
import {
  useShoppingStore,
  selectShoppingList,
  selectShoppingSession,
  selectShoppingHistory,
} from "@/store/shopping-store"
import type { InventoryUpdate } from "@/types/shopping"

/** Progress summary for the active shopping session. */
export type SessionProgress = {
  total: number
  purchased: number
  partial: number
  skipped: number
  pending: number
  /** 0-100 */
  pct: number
}

/** The full hook for reading + driving the shopping session. */
export function useShoppingSession() {
  const listItems = useShoppingStore(selectShoppingList)
  const session = useShoppingStore(selectShoppingSession)
  const history = useShoppingStore(selectShoppingHistory)

  const actions = useShoppingStore(
    useShallow((s) => ({
      addToList: s.addToList,
      removeFromList: s.removeFromList,
      updateListItemQty: s.updateListItemQty,
      clearList: s.clearList,
      replaceAutoDetected: s.replaceAutoDetected,
      startSession: s.startSession,
      addManualItem: s.addManualItem,
      setBoughtQty: s.setBoughtQty,
      setItemState: s.setItemState,
      markAllPurchased: s.markAllPurchased,
      finishSession: s.finishSession,
      cancelSession: s.cancelSession,
    }))
  )

  /** Items that should be applied to inventory after completing the session. */
  const inventoryUpdates = useMemo((): InventoryUpdate[] => {
    if (!session) return []
    return session.items
      .filter((i) => i.boughtQty > 0 && i.inventoryItemId)
      .map((i) => ({
        inventoryItemId: i.inventoryItemId!,
        name: i.name,
        unit: i.unit,
        currentStock: i.currentStock,
        addedQty: i.boughtQty,
        newStock: i.currentStock + i.boughtQty,
      }))
  }, [session])

  /** Aggregated progress for the active session. */
  const progress = useMemo((): SessionProgress | null => {
    if (!session) return null
    const total = session.items.length
    const purchased = session.items.filter((i) => i.state === "purchased").length
    const partial = session.items.filter((i) => i.state === "partial").length
    const skipped = session.items.filter((i) => i.state === "skipped").length
    const pending = session.items.filter((i) => i.state === "pending").length
    const pct = total === 0 ? 0 : Math.round(((purchased + partial * 0.5) / total) * 100)
    return { total, purchased, partial, skipped, pending, pct }
  }, [session])

  return {
    listItems,
    session,
    history,
    progress,
    inventoryUpdates,
    isSessionActive: session?.status === "active",
    ...actions,
  }
}
