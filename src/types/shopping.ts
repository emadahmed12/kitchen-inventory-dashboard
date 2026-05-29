/** State of a single item within a shopping session. */
export type ShoppingItemState = "pending" | "partial" | "purchased" | "skipped"

/** A single item in a shopping session. */
export type ShoppingSessionItem = {
  id: string
  /** Points to an inventory item. Undefined for manually added items. */
  inventoryItemId?: string
  name: string
  unit: string
  /** How much the user planned to buy. */
  neededQty: number
  /** How much was actually put in the cart (updated live during shopping). */
  boughtQty: number
  /** Inventory quantity BEFORE the shopping session started. */
  currentStock: number
  state: ShoppingItemState
  sortOrder: number
}

/** An active or completed shopping session. */
export type ShoppingSession = {
  id: string
  status: "active" | "completed" | "cancelled"
  startedAt: string
  completedAt?: string
  items: ShoppingSessionItem[]
}

/** A single inventory update to apply after completing a session. */
export type InventoryUpdate = {
  inventoryItemId: string
  name: string
  unit: string
  currentStock: number
  addedQty: number
  newStock: number
}

/** Pre-session shopping list item (shown before "Start Shopping"). */
export type ShoppingListItem = {
  id: string
  inventoryItemId?: string
  name: string
  unit: string
  neededQty: number
  currentStock: number
  /** true when auto-added from low-stock detection */
  isAutoDetected: boolean
}
