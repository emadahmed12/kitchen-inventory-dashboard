"use client"

import { useMemo } from "react"

import {
  computeCategoryBreakdown,
  computeInventoryStats,
  computeLocationOccupancy,
  getLowStockItems,
} from "@/lib/inventory/stats"
import { useInventoryItems } from "@/hooks/use-inventory"
import { useStorageLocations } from "@/hooks/use-storage"

export function useInventoryStats() {
  const items = useInventoryItems()
  const locations = useStorageLocations()

  return useMemo(
    () => ({
      stats: computeInventoryStats(items),
      categoryBreakdown: computeCategoryBreakdown(items),
      // Pass dynamic locations so occupancy reflects user-created storage
      locationOccupancy: computeLocationOccupancy(items, locations),
      lowStockItems: getLowStockItems(items),
      recentItems: [...items]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 6),
    }),
    [items, locations]
  )
}
