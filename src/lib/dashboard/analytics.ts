import { STATUS_LABELS } from "@/lib/inventory/constants"
import {
  computeCategoryBreakdown,
  computeLocationOccupancy,
  getLowStockItems,
} from "@/lib/inventory/stats"
import { needsAttention } from "@/lib/inventory/status"
import type { InventoryItem, InventoryStatus } from "@/types/inventory"

export function getStatusChartData(items: InventoryItem[]) {
  const statuses: InventoryStatus[] = [
    "healthy",
    "opened",
    "low",
    "almost_finished",
  ]
  return statuses.map((status) => ({
    name: STATUS_LABELS[status],
    value: items.filter((i) => i.status === status).length,
    status,
  }))
}

export function getCategoryChartData(items: InventoryItem[]) {
  return computeCategoryBreakdown(items).map(({ name, value }) => ({
    name,
    value,
  }))
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
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 6)
}

export function getInsights(items: InventoryItem[]) {
  const opened = items.filter((i) => i.status === "opened").length
  const low = items.filter(needsAttention).length
  const pasta = items.filter((i) => i.category === "pasta").length

  const insights: {
    id: string
    title: string
    body: string
    tone: "info" | "warn" | "success"
  }[] = []

  if (low > 0) {
    insights.push({
      id: "low",
      title: "تنبيه مخزون",
      body: `${low.toLocaleString("ar-EG")} منتجات تحتاج إعادة تموين قريباً.`,
      tone: "warn",
    })
  }

  if (opened >= 8) {
    insights.push({
      id: "opened",
      title: "منتجات مفتوحة",
      body: `${opened.toLocaleString("ar-EG")} عناصر مفتوحة — راجع تواريخ الاستخدام.`,
      tone: "info",
    })
  }

  if (pasta >= 5) {
    insights.push({
      id: "pasta",
      title: "مخزون المعكرونة",
      body: "لديك مخزون معكرونة جيد — مثالي للوجبات السريعة.",
      tone: "success",
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: "ok",
      title: "كل شيء منظم",
      body: "مخزونك متوازن اليوم. استمر في التحديث.",
      tone: "success",
    })
  }

  return insights
}
