import { getCategoryLabel, getLocationLabel, getUnitById } from "@/lib/inventory/catalog-helpers"
import type { InventoryItem } from "@/types/inventory"

export function formatQuantity(item: InventoryItem): string {
  const unit = getUnitById(item.unit)
  const num = item.quantity.toLocaleString("ar-EG")
  if (item.quantity === 1) return `${unit.label} واحدة`
  return `${num} ${unit.labelPlural}`
}

export function formatItemSummary(item: InventoryItem): string {
  return `${item.name} · ${formatQuantity(item)} · ${getCategoryLabel(item.category)} · ${getLocationLabel(item.location)}`
}
