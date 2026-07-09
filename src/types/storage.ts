/**
 * Dynamic storage location types.
 *
 * `UserStorageLocation` is the full shape returned by the Supabase DB.
 * The old static catalog `StorageLocation` (with `label` / `capacity`) is
 * kept in `types/catalog.ts` for the fallback/seed-data path.
 */

export type StorageType =
  | "fridge"
  | "freezer"
  | "pantry"
  | "cabinet"
  | "counter"
  | "other"

/** A storage location managed in the database (per-user). */
export type UserStorageLocation = {
  /** Text id — either a static slug ('kitchen') or a UUID for custom locations. */
  id: string
  userId: string
  name: string
  type: StorageType
  capacity: number
  color?: string
  icon?: string
  notes?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

/** Payload for creating or updating a storage location. */
export type StorageLocationInput = {
  name: string
  type: StorageType
  capacity: number
  color?: string
  icon?: string
  notes?: string
}

/** A lightweight occupancy row returned by computeLocationOccupancy. */
export type LocationOccupancy = {
  locationId: string
  location: string   // display name
  count: number
  pct: number
  capacity: number
}
