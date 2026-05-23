import {
  Bean,
  Box,
  Coffee,
  Cookie,
  Drumstick,
  FlaskConical,
  Package,
  Wheat,
  type LucideIcon,
} from "lucide-react"

import type { CategoryId } from "@/types/catalog"

const CATEGORY_ICON_MAP: Record<CategoryId, LucideIcon> = {
  canned: Package,
  grains: Wheat,
  pasta: Box,
  bread: Cookie,
  beverages: Coffee,
  spices: Bean,
  oils: FlaskConical,
}

export function getCategoryIcon(category: CategoryId): LucideIcon {
  return CATEGORY_ICON_MAP[category] ?? Drumstick
}
