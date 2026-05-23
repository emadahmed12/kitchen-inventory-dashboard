import type { InventoryItem, InventoryStatus } from "@/types/inventory"

/** True when quantity is at or below the configured threshold */
export function isLowStock(item: Pick<InventoryItem, "quantity" | "lowStockThreshold">): boolean {
  return item.quantity <= item.lowStockThreshold
}

/** Items that need user attention (low, almost finished, or below threshold) */
export function needsAttention(item: InventoryItem): boolean {
  return (
    item.status === "low" ||
    item.status === "almost_finished" ||
    isLowStock(item)
  )
}

/** Suggest status from quantity + tags (manual almost_finished is preserved) */
export function suggestStatus(
  item: Pick<InventoryItem, "quantity" | "lowStockThreshold" | "status" | "tags">
): InventoryStatus {
  if (item.status === "almost_finished") return "almost_finished"
  if (item.tags.includes("opened")) return "opened"
  if (isLowStock(item)) return "low"
  if (item.status === "opened") return "opened"
  return "healthy"
}

/** Merge suggested status when quantity changes */
export function statusAfterQuantityChange(
  item: InventoryItem,
  quantity: number
): InventoryStatus {
  if (item.status === "almost_finished") return "almost_finished"
  const next = { ...item, quantity }
  if (isLowStock(next)) return "low"
  if (item.tags.includes("opened") || item.status === "opened") return "opened"
  return "healthy"
}
