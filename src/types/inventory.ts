import type { CategoryId, StorageLocationId, UnitTypeId } from "@/types/catalog"

/** Stock / usage status */
export type InventoryStatus =
  | "healthy"
  | "opened"
  | "low"
  | "almost_finished"

export type InventoryItemMetadata = {
  brand?: string
  expiryDate?: string
  openedAt?: string
  weightKg?: number
  volumeLiters?: number
  /** Extensible key-value pairs */
  [key: string]: string | number | boolean | undefined
}

export type InventoryItem = {
  id: string
  name: string
  quantity: number
  unit: UnitTypeId
  category: CategoryId
  location: StorageLocationId
  status: InventoryStatus
  /** Alert when quantity is at or below this value */
  lowStockThreshold: number
  notes?: string
  tags: string[]
  metadata: InventoryItemMetadata
  /** Public URL of the item image stored in Supabase Storage */
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

/** Payload for creating or updating an item (server-safe shape) */
export type InventoryItemInput = {
  name: string
  quantity: number
  unit: UnitTypeId
  category: CategoryId
  location: StorageLocationId
  status?: InventoryStatus
  lowStockThreshold?: number
  notes?: string
  tags?: string[]
  metadata?: InventoryItemMetadata
  imageUrl?: string
}

export type InventoryStats = {
  total: number
  opened: number
  low: number
  almostFinished: number
  needsAttention: number
  categories: number
  healthy: number
  totalQuantity: number
}
