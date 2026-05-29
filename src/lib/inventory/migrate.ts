import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/data/catalog"
import { SEED_INVENTORY } from "@/data/seed-inventory"
import type { CategoryId, UnitTypeId } from "@/types/catalog"
import type { InventoryItem, InventoryStatus } from "@/types/inventory"

const LEGACY_STORAGE_KEY = "kitchen-inventory-v1"

const LEGACY_CATEGORY_MAP: Record<string, CategoryId> = {
  canned: "canned",
  rice_grains: "grains",
  pasta: "pasta",
  flour: "bread",
  legumes: "grains",
  beverages: "beverages",
  condiments: "spices",
  snacks: "pasta",
}

const LEGACY_LOCATION_MAP: Record<string, string> = {
  "الخزانة الجافة": "pantry",
  "الرف العلوي": "pantry",
  "درج المعكرونة": "kitchen",
  "خزانة التوابل": "kitchen",
  "سطح المطبخ": "kitchen",
  "الثلاجة": "fridge",
  "المطبخ": "kitchen",
  "الفريزر": "freezer",
  "المخزن": "pantry",
}

const LEGACY_UNIT_MAP: Record<string, UnitTypeId> = {
  علبة: "can",
  كيس: "bag",
  زجاجة: "bottle",
  كيلو: "kg",
  عبوة: "can",
  قطعة: "bag",
}

type LegacyItem = {
  id: string
  name: string
  quantity: number
  unit: string
  category: string
  location: string
  status: InventoryStatus
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export function migrateLegacyItem(raw: LegacyItem): InventoryItem {
  const tags: string[] = []
  if (raw.status === "opened" || raw.notes?.includes("مفتوح") || raw.notes?.includes("استخدام")) {
    tags.push("opened")
  }

  const category =
    LEGACY_CATEGORY_MAP[raw.category] ??
    (raw.name.includes("زيت") || raw.name.includes("سمن") ? "oils" : "grains")

  const location =
    LEGACY_LOCATION_MAP[raw.location] ??
    (raw.location.includes("ثلاج") ? "fridge" : "pantry")

  const unit = LEGACY_UNIT_MAP[raw.unit] ?? "bag"

  const lowStockThreshold =
    raw.status === "low" || raw.status === "almost_finished" ? 1 : DEFAULT_LOW_STOCK_THRESHOLD

  return {
    id: raw.id,
    name: raw.name,
    quantity: raw.quantity,
    unit,
    category,
    location,
    status: raw.status,
    lowStockThreshold,
    notes: raw.notes,
    tags,
    metadata: {},
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

export function loadLegacyFromStorage(): InventoryItem[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LegacyItem[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed.map(migrateLegacyItem)
  } catch {
    return null
  }
}

export function getInitialInventoryItems(): InventoryItem[] {
  const legacy = loadLegacyFromStorage()
  return legacy ?? SEED_INVENTORY
}
