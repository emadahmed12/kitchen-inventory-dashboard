import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/data/catalog"
import type { InventoryItem } from "@/types/inventory"

const now = new Date().toISOString()

type SeedInput = Omit<
  InventoryItem,
  "createdAt" | "updatedAt" | "tags" | "metadata" | "lowStockThreshold"
> & {
  tags?: string[]
  metadata?: InventoryItem["metadata"]
  lowStockThreshold?: number
}

function seed(partial: SeedInput): InventoryItem {
  const { tags, metadata, lowStockThreshold, ...rest } = partial
  return {
    ...rest,
    tags: tags ?? [],
    metadata: metadata ?? {},
    lowStockThreshold: lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
    createdAt: now,
    updatedAt: now,
  }
}

export const SEED_INVENTORY: InventoryItem[] = [
  seed({ id: "inv-001", name: "علب تونة", quantity: 6, unit: "can", category: "canned", location: "pantry", status: "healthy" }),
  seed({ id: "inv-002", name: "علبة رز للاستخدام", quantity: 1, unit: "can", category: "grains", location: "pantry", status: "opened", notes: "قيد الاستخدام", tags: ["opened"] }),
  seed({ id: "inv-003", name: "علبة لسان عصفور للاستخدام", quantity: 1, unit: "can", category: "pasta", location: "kitchen", status: "opened", notes: "قيد الاستخدام", tags: ["opened"] }),
  seed({ id: "inv-004", name: "علبة شعرية للاستخدام", quantity: 1, unit: "can", category: "pasta", location: "kitchen", status: "opened", notes: "قيد الاستخدام", tags: ["opened"] }),
  seed({ id: "inv-005", name: "علبة دقيق متعدد الاستخدامات للاستخدام", quantity: 1, unit: "can", category: "bread", location: "pantry", status: "opened", notes: "قيد الاستخدام", tags: ["opened"] }),
  seed({ id: "inv-006", name: "علبة سمنة", quantity: 1, unit: "can", category: "oils", location: "fridge", status: "almost_finished", notes: "قاربت على الانتهاء", lowStockThreshold: 1 }),
  seed({ id: "inv-007", name: "كيس حمص شام", quantity: 1, unit: "bag", category: "grains", location: "pantry", status: "opened", notes: "مفتوح", tags: ["opened"] }),
  seed({ id: "inv-008", name: "كيس شاي", quantity: 1, unit: "bag", category: "beverages", location: "kitchen", status: "opened", notes: "مفتوح", tags: ["opened"] }),
  seed({ id: "inv-009", name: "كيس رز", quantity: 1, unit: "bag", category: "grains", location: "pantry", status: "opened", notes: "مفتوح", tags: ["opened"] }),
  seed({ id: "inv-010", name: "كيس سكر", quantity: 2, unit: "bag", category: "spices", location: "kitchen", status: "healthy", notes: "كيلو", metadata: { weightKg: 1 } }),
  seed({ id: "inv-011", name: "كيس رز الضحى", quantity: 1, unit: "bag", category: "grains", location: "pantry", status: "healthy", notes: "كيلو", metadata: { weightKg: 1 } }),
  seed({ id: "inv-012", name: "كيس اندومي", quantity: 4, unit: "bag", category: "pasta", location: "kitchen", status: "healthy" }),
  seed({ id: "inv-013", name: "كيس مكرونة كوري", quantity: 4, unit: "bag", category: "pasta", location: "kitchen", status: "healthy" }),
  seed({ id: "inv-014", name: "كيس دقيق", quantity: 1, unit: "bag", category: "bread", location: "pantry", status: "opened", notes: "مفتوح", tags: ["opened"] }),
  seed({ id: "inv-015", name: "كيس كسكسي", quantity: 1, unit: "bag", category: "grains", location: "pantry", status: "opened", notes: "مفتوح", tags: ["opened"] }),
  seed({ id: "inv-016", name: "كيس مكرونة متنوع", quantity: 2, unit: "bag", category: "pasta", location: "kitchen", status: "opened", notes: "مفتوح", tags: ["opened"] }),
  seed({ id: "inv-017", name: "كيس مكرونة", quantity: 8, unit: "bag", category: "pasta", location: "kitchen", status: "healthy", notes: "كيلو", metadata: { weightKg: 1 } }),
  seed({ id: "inv-018", name: "كيس مكرونة نصف كيلو", quantity: 3, unit: "bag", category: "pasta", location: "kitchen", status: "healthy", metadata: { weightKg: 0.5 } }),
  seed({ id: "inv-019", name: "كيس ملح صغير", quantity: 3, unit: "bag", category: "spices", location: "kitchen", status: "low", lowStockThreshold: 3 }),
  seed({ id: "inv-020", name: "كيس شعرية", quantity: 2, unit: "bag", category: "pasta", location: "kitchen", status: "healthy", notes: "كيلو", metadata: { weightKg: 1 } }),
  seed({ id: "inv-021", name: "كيس فشار", quantity: 1, unit: "bag", category: "grains", location: "pantry", status: "low", notes: "كيلو", lowStockThreshold: 1, metadata: { weightKg: 1 } }),
  seed({ id: "inv-022", name: "كيس حبوب شيا", quantity: 1, unit: "bag", category: "grains", location: "pantry", status: "low", lowStockThreshold: 1 }),
  seed({ id: "inv-023", name: "كيس برغل", quantity: 2, unit: "bag", category: "grains", location: "pantry", status: "healthy" }),
  seed({ id: "inv-024", name: "كيس فول مدشوش", quantity: 1, unit: "bag", category: "grains", location: "pantry", status: "opened", notes: "مفتوح", tags: ["opened"] }),
  seed({ id: "inv-025", name: "زجاجة بديل ليمون", quantity: 1, unit: "bottle", category: "spices", location: "kitchen", status: "healthy" }),
  seed({ id: "inv-026", name: "زجاجة زيت", quantity: 1, unit: "bottle", category: "oils", location: "kitchen", status: "healthy", notes: "٢٫٥ لتر", metadata: { volumeLiters: 2.5 } }),
]
