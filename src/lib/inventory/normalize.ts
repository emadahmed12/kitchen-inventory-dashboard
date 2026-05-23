import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/data/catalog"
import { generateInventoryId } from "@/lib/inventory/id"
import { suggestStatus } from "@/lib/inventory/status"
import type { InventoryItem, InventoryItemInput } from "@/types/inventory"

export function createInventoryItem(input: InventoryItemInput): InventoryItem {
  const now = new Date().toISOString()
  const draft: InventoryItem = {
    id: generateInventoryId(),
    name: input.name.trim(),
    quantity: Math.max(1, input.quantity),
    unit: input.unit,
    category: input.category,
    location: input.location,
    lowStockThreshold: input.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
    notes: input.notes?.trim() || undefined,
    tags: input.tags ?? [],
    metadata: input.metadata ?? {},
    status: input.status ?? "healthy",
    createdAt: now,
    updatedAt: now,
  }
  return {
    ...draft,
    status: input.status ?? suggestStatus(draft),
  }
}

export function mergeInventoryItem(
  existing: InventoryItem,
  input: InventoryItemInput
): InventoryItem {
  const now = new Date().toISOString()
  const merged: InventoryItem = {
    ...existing,
    name: input.name.trim(),
    quantity: Math.max(1, input.quantity),
    unit: input.unit,
    category: input.category,
    location: input.location,
    lowStockThreshold: input.lowStockThreshold ?? existing.lowStockThreshold,
    notes: input.notes?.trim() || undefined,
    tags: input.tags ?? existing.tags,
    metadata: { ...existing.metadata, ...input.metadata },
    status: input.status ?? existing.status,
    updatedAt: now,
  }
  return {
    ...merged,
    status: input.status ?? suggestStatus(merged),
  }
}
