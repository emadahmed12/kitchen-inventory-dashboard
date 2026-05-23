import type { InventoryStatus } from "@/types/inventory"

export const STORE_STORAGE_KEY = "kitchen-inventory-store-v2"
export const LEGACY_STORAGE_KEY = "kitchen-inventory-v1"
export const VIEW_STORAGE_KEY = "kitchen-inventory-view-v1"

export const STATUS_LABELS: Record<InventoryStatus, string> = {
  healthy: "سليم",
  opened: "مفتوح",
  low: "مخزون منخفض",
  almost_finished: "قارب على الانتهاء",
}

export const STATUS_COLORS: Record<
  InventoryStatus,
  { dot: string; ring: string; badge: string; glow: string }
> = {
  healthy: {
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/25",
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20",
    glow: "shadow-[0_0_0_1px_oklch(0.72_0.17_155/0.15)]",
  },
  opened: {
    dot: "bg-amber-500",
    ring: "ring-amber-500/25",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20",
    glow: "shadow-[0_0_0_1px_oklch(0.75_0.15_75/0.15)]",
  },
  low: {
    dot: "bg-red-500",
    ring: "ring-red-500/25",
    badge: "bg-red-500/10 text-red-700 dark:text-red-400 ring-red-500/20",
    glow: "shadow-[0_0_0_1px_oklch(0.63_0.2_25/0.15)]",
  },
  almost_finished: {
    dot: "bg-orange-500",
    ring: "ring-orange-500/25",
    badge:
      "bg-orange-500/10 text-orange-700 dark:text-orange-400 ring-orange-500/20",
    glow: "shadow-[0_0_0_1px_oklch(0.7_0.16_45/0.15)]",
  },
}

export const SORT_LABELS: Record<string, string> = {
  "name-asc": "الاسم (أ-ي)",
  "name-desc": "الاسم (ي-أ)",
  "quantity-desc": "الكمية (الأكثر)",
  "quantity-asc": "الكمية (الأقل)",
  status: "حالة المخزون",
  "updated-desc": "آخر تحديث",
}
