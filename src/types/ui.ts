import type { CategoryId } from "@/types/catalog"
import type { InventoryStatus } from "@/types/inventory"

export type SortOption =
  | "name-asc"
  | "name-desc"
  | "quantity-desc"
  | "quantity-asc"
  | "status"
  | "updated-desc"

export type ViewMode = "grid" | "list"

/**
 * `needsAttention` is a virtual filter combining `low` + `almost_finished`.
 * It is applied via URL (?status=needsAttention) from the dashboard KPI card.
 */
export type StatusFilter = InventoryStatus | "all" | "needsAttention"

export type InventoryFilterState = {
  search: string
  category: CategoryId | "all"
  status: StatusFilter
  sort: SortOption
}
