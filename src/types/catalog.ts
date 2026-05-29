/** Category identifiers — normalized catalog keys */
export type CategoryId =
  | "canned"
  | "grains"
  | "pasta"
  | "bread"
  | "beverages"
  | "spices"
  | "oils"

/**
 * Storage location identifier.
 *
 * Intentionally widened to `string` to support dynamic user-created storage
 * locations alongside the four built-in static slugs ('kitchen', 'fridge',
 * 'freezer', 'pantry').  Those static slugs remain valid string literals —
 * no existing inventory data needs migrating.
 */
export type StorageLocationId = string

/** Unit type identifiers */
export type UnitTypeId = "kg" | "can" | "bag" | "bottle"

export type Category = {
  id: CategoryId
  label: string
  description?: string
}

/** Static catalog shape — kept for seed / fallback purposes. */
export type StorageLocation = {
  id: StorageLocationId
  label: string
  /** Default capacity (max items before considered full). */
  capacity: number
}

export type UnitType = {
  id: UnitTypeId
  label: string
  labelPlural: string
}
