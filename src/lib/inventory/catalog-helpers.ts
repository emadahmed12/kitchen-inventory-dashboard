import {
  CATEGORIES,
  STORAGE_LOCATIONS,
  UNIT_TYPES,
} from "@/data/catalog"
import type { CategoryId, StorageLocationId, UnitTypeId } from "@/types/catalog"

const categoryMap = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c])
) as Record<CategoryId, (typeof CATEGORIES)[number]>

const locationMap = Object.fromEntries(
  STORAGE_LOCATIONS.map((l) => [l.id, l])
) as Record<StorageLocationId, (typeof STORAGE_LOCATIONS)[number]>

const unitMap = Object.fromEntries(
  UNIT_TYPES.map((u) => [u.id, u])
) as Record<UnitTypeId, (typeof UNIT_TYPES)[number]>

export function getCategoryById(id: CategoryId) {
  return categoryMap[id]
}

export function getCategoryLabel(id: CategoryId): string {
  return categoryMap[id]?.label ?? id
}

export function getLocationById(id: StorageLocationId) {
  return locationMap[id]
}

export function getLocationLabel(id: StorageLocationId): string {
  return locationMap[id]?.label ?? id
}

export function getUnitById(id: UnitTypeId) {
  return unitMap[id]
}

export function getUnitLabel(id: UnitTypeId): string {
  return unitMap[id]?.label ?? id
}
