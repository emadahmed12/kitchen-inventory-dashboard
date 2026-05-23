import {
  computeCategoryBreakdown,
  computeLocationOccupancy,
  getLowStockItems,
} from "@/lib/inventory/stats"
import { needsAttention } from "@/lib/inventory/status"
import type { InventoryItem, InventoryStatus } from "@/types/inventory"

/**
 * Returns chart data for the status chart.
 * Accepts a label getter so callers can pass translated strings.
 */
export function getStatusChartData(
  items: InventoryItem[],
  getLabel: (status: InventoryStatus) => string
) {
  const statuses: InventoryStatus[] = ["healthy", "opened", "low", "almost_finished"]
  return statuses.map((status) => ({
    name: getLabel(status),
    value: items.filter((i) => i.status === status).length,
    status,
  }))
}

export function getCategoryChartData(items: InventoryItem[]) {
  return computeCategoryBreakdown(items).map(({ name, value }) => ({ name, value }))
}

export function getStorageOccupancy(items: InventoryItem[]) {
  return computeLocationOccupancy(items).map((s) => ({
    location: s.location,
    count: s.count,
    pct: s.pct,
  }))
}

export { getLowStockItems }

export function getRecentActivity(items: InventoryItem[]) {
  return [...items]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)
}

/**
 * Structured insight — no hardcoded strings.
 * Components render title/body via useTranslations('insights').
 */
export type InsightData = {
  id: "low" | "opened" | "pasta" | "ok"
  count?: number
  tone: "info" | "warn" | "success"
}

export function getInsights(items: InventoryItem[]): InsightData[] {
  const opened = items.filter((i) => i.status === "opened").length
  const low = items.filter(needsAttention).length
  const pasta = items.filter((i) => i.category === "pasta").length

  const insights: InsightData[] = []

  if (low > 0) insights.push({ id: "low", count: low, tone: "warn" })
  if (opened >= 8) insights.push({ id: "opened", count: opened, tone: "info" })
  if (pasta >= 5) insights.push({ id: "pasta", tone: "success" })
  if (insights.length === 0) insights.push({ id: "ok", tone: "success" })

  return insights
}
