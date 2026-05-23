/** Category identifiers — normalized catalog keys */
export type CategoryId =
  | "canned"
  | "grains"
  | "pasta"
  | "bread"
  | "beverages"
  | "spices"
  | "oils"

/** Storage location identifiers */
export type StorageLocationId = "kitchen" | "fridge" | "freezer" | "pantry"

/** Unit type identifiers */
export type UnitTypeId = "kg" | "can" | "bag" | "bottle"

export type Category = {
  id: CategoryId
  label: string
  description?: string
}

export type StorageLocation = {
  id: StorageLocationId
  label: string
  /** Max items before considered full (for occupancy UI) */
  capacity: number
}

export type UnitType = {
  id: UnitTypeId
  label: string
  /** Plural label for quantity display */
  labelPlural: string
}
