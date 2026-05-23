import type { InventoryFilterState } from "@/types/ui"
import type { InventoryItem } from "@/types/inventory"
import { getCategoryLabel, getLocationLabel } from "@/lib/inventory/catalog-helpers"

const STATUS_ORDER: Record<InventoryItem["status"], number> = {
  almost_finished: 0,
  low: 1,
  opened: 2,
  healthy: 3,
}

function compareItems(
  a: InventoryItem,
  b: InventoryItem,
  sort: InventoryFilterState["sort"]
) {
  switch (sort) {
    case "name-asc":
      return a.name.localeCompare(b.name, "ar")
    case "name-desc":
      return b.name.localeCompare(a.name, "ar")
    case "quantity-desc":
      return b.quantity - a.quantity
    case "quantity-asc":
      return a.quantity - b.quantity
    case "status":
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    case "updated-desc":
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    default:
      return 0
  }
}

export function filterAndSortItems(
  items: InventoryItem[],
  filters: InventoryFilterState
): InventoryItem[] {
  let result = [...items]
  const q = filters.search.trim().toLowerCase()

  if (q) {
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        getCategoryLabel(item.category).toLowerCase().includes(q) ||
        getLocationLabel(item.location).toLowerCase().includes(q)
    )
  }

  if (filters.category !== "all") {
    result = result.filter((item) => item.category === filters.category)
  }

  if (filters.status !== "all") {
    result = result.filter((item) => item.status === filters.status)
  }

  return result.sort((a, b) => compareItems(a, b, filters.sort))
}

export function hasActiveFilters(filters: InventoryFilterState): boolean {
  return (
    filters.search !== "" ||
    filters.category !== "all" ||
    filters.status !== "all"
  )
}
