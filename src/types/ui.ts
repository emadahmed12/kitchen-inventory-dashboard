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

export type InventoryFilterState = {
  search: string
  category: CategoryId | "all"
  status: InventoryStatus | "all"
  sort: SortOption
}
