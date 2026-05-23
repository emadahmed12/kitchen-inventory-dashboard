import type { Category, StorageLocation, UnitType } from "@/types/catalog"

export const CATEGORIES: readonly Category[] = [
  { id: "canned", label: "معلبات", description: "معلبات ومحفوظات" },
  { id: "grains", label: "حبوب", description: "أرز، برغل، بقوليات" },
  { id: "pasta", label: "مكرونات", description: "معكرونة وشعرية" },
  { id: "bread", label: "خبز", description: "دقيق ومخبوزات" },
  { id: "beverages", label: "مشروبات", description: "شاي وغيره" },
  { id: "spices", label: "توابل", description: "ملح وتوابل" },
  { id: "oils", label: "زيوت", description: "زيوت وسمن" },
] as const

export const STORAGE_LOCATIONS: readonly StorageLocation[] = [
  { id: "kitchen", label: "المطبخ", capacity: 12 },
  { id: "fridge", label: "الثلاجة", capacity: 10 },
  { id: "freezer", label: "الفريزر", capacity: 8 },
  { id: "pantry", label: "المخزن", capacity: 20 },
] as const

export const UNIT_TYPES: readonly UnitType[] = [
  { id: "kg", label: "كيلو", labelPlural: "كيلو" },
  { id: "can", label: "علبة", labelPlural: "علب" },
  { id: "bag", label: "كيس", labelPlural: "أكياس" },
  { id: "bottle", label: "زجاجة", labelPlural: "زجاجات" },
] as const

export const DEFAULT_LOW_STOCK_THRESHOLD = 2
