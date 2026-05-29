import { CATEGORIES, STORAGE_LOCATIONS } from "@/data/catalog"
import { needsAttention, isLowStock } from "@/lib/inventory/status"
import type { CategoryId } from "@/types/catalog"
import type { InventoryItem, InventoryStats } from "@/types/inventory"
import type { UserStorageLocation, LocationOccupancy } from "@/types/storage"

export function computeInventoryStats(items: InventoryItem[]): InventoryStats {
  const categorySet = new Set<CategoryId>()
  let opened = 0
  let low = 0
  let almostFinished = 0
  let healthy = 0
  let needsAttentionCount = 0
  let totalQuantity = 0

  for (const item of items) {
    categorySet.add(item.category)
    totalQuantity += item.quantity
    if (item.status === "opened") opened++
    if (item.status === "low" || isLowStock(item)) low++
    if (item.status === "almost_finished") almostFinished++
    if (item.status === "healthy" && !isLowStock(item)) healthy++
    if (needsAttention(item)) needsAttentionCount++
  }

  return {
    total: items.length,
    opened,
    low,
    almostFinished,
    needsAttention: needsAttentionCount,
    categories: categorySet.size,
    healthy,
    totalQuantity,
  }
}

export function computeCategoryBreakdown(items: InventoryItem[]) {
  return CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.label,
    value: items.filter((i) => i.category === cat.id).length,
  })).filter((d) => d.value > 0)
}

/**
 * Compute per-location occupancy.
 *
 * When `dynamicLocations` is provided (Supabase-loaded), those take
 * precedence. Falls back to the static STORAGE_LOCATIONS catalog so
 * the dashboard continues to work in dev / offline mode.
 */
export function computeLocationOccupancy(
  items: InventoryItem[],
  dynamicLocations?: UserStorageLocation[]
): LocationOccupancy[] {
  const locations =
    dynamicLocations && dynamicLocations.length > 0
      ? dynamicLocations.map((l) => ({
          id: l.id,
          label: l.name,
          capacity: l.capacity,
        }))
      : STORAGE_LOCATIONS.map((l) => ({
          id: l.id,
          label: l.label,
          capacity: l.capacity,
        }))

  return locations
    .map((loc) => {
      const count = items.filter((i) => i.location === loc.id).length
      const pct = Math.min(100, Math.round((count / loc.capacity) * 100))
      return {
        locationId: loc.id,
        location: loc.label,
        count,
        pct,
        capacity: loc.capacity,
      }
    })
    .filter((s) => s.count > 0)
}

export function getLowStockItems(items: InventoryItem[], limit = 5) {
  return items
    .filter(needsAttention)
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, limit)
}
