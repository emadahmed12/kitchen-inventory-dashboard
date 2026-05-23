"use client"

import { useMemo } from "react"

import {
  computeCategoryBreakdown,
  computeInventoryStats,
  computeLocationOccupancy,
  getLowStockItems,
} from "@/lib/inventory/stats"
import { useInventoryItems } from "@/hooks/use-inventory"

export function useInventoryStats() {
  const items = useInventoryItems()

  return useMemo(
    () => ({
      stats: computeInventoryStats(items),
      categoryBreakdown: computeCategoryBreakdown(items),
      locationOccupancy: computeLocationOccupancy(items),
      lowStockItems: getLowStockItems(items),
      recentItems: [...items]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 6),
    }),
    [items]
  )
}
