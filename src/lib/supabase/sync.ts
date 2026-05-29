/**
 * Type mapping between Supabase DB rows and local InventoryItem shape.
 * Keeps the rest of the codebase decoupled from DB column names.
 */

import type { DbInventoryItem, DbInventoryItemInsert, Json } from "./types"
import type { InventoryItem, InventoryItemInput } from "@/types/inventory"
import type { CategoryId, UnitTypeId } from "@/types/catalog"

/** Map a DB row → local InventoryItem */
export function dbItemToLocal(row: DbInventoryItem): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    unit: row.unit as UnitTypeId,
    category: row.category as CategoryId,
    location: row.location,
    status: row.status,
    lowStockThreshold: row.low_stock_threshold,
    notes: row.notes ?? undefined,
    tags: row.tags,
    metadata: (row.metadata as InventoryItem["metadata"]) ?? {},
    imageUrl: row.image_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Map a local InventoryItemInput → DB insert shape */
export function localInputToDb(
  input: InventoryItemInput,
  userId: string
): DbInventoryItemInsert {
  return {
    user_id: userId,
    name: input.name,
    quantity: input.quantity,
    unit: input.unit,
    category: input.category,
    location: input.location,
    status: input.status ?? "healthy",
    low_stock_threshold: input.lowStockThreshold ?? 2,
    notes: input.notes ?? null,
    tags: input.tags ?? [],
    metadata: (input.metadata ?? {}) as Json,
    image_url: input.imageUrl ?? null,
  }
}

/** Map a local InventoryItem → DB update shape */
export function localItemToDbUpdate(
  item: Partial<InventoryItemInput>
): Partial<Omit<DbInventoryItem, "id" | "user_id" | "created_at">> {
  const update: Partial<Omit<DbInventoryItem, "id" | "user_id" | "created_at">> = {}
  if (item.name !== undefined) update.name = item.name
  if (item.quantity !== undefined) update.quantity = item.quantity
  if (item.unit !== undefined) update.unit = item.unit
  if (item.category !== undefined) update.category = item.category
  if (item.location !== undefined) update.location = item.location
  if (item.status !== undefined) update.status = item.status
  if (item.lowStockThreshold !== undefined) update.low_stock_threshold = item.lowStockThreshold
  if (item.notes !== undefined) update.notes = item.notes ?? null
  if (item.tags !== undefined) update.tags = item.tags
  if (item.metadata !== undefined) update.metadata = (item.metadata ?? {}) as Json
  if (item.imageUrl !== undefined) update.image_url = item.imageUrl ?? null
  return update
}
