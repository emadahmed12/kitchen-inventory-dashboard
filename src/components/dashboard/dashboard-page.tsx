"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { AlertTriangle, Boxes, FolderOpen, Tags } from "lucide-react"

// Static imports — next/dynamic(ssr:false) with .then() chaining leaks a
// Suspense promise that propagates to the route-level loading.tsx boundary
// in Next.js 16 App Router production builds, causing infinite skeleton.
import { CategoryChart } from "@/components/dashboard/category-chart"
import { InsightsWidgets } from "@/components/dashboard/insights-widgets"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusChart } from "@/components/dashboard/status-chart"
import { StorageOccupancy } from "@/components/dashboard/storage-occupancy"
import { PageContainer } from "@/components/ui/page-container"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { useInventoryHydrated, useInventoryItems } from "@/hooks/use-inventory"
import { useInventoryStats } from "@/hooks/use-inventory-stats"
import { getInsights, getStatusChartData } from "@/lib/dashboard/analytics"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { InventoryStatus } from "@/types/inventory"

export function DashboardPage() {
  const hydrated = useInventoryHydrated()
  const items = useInventoryItems()
  const { stats, categoryBreakdown, locationOccupancy, lowStockItems, recentItems } =
    useInventoryStats()
  const t = useTranslations("dashboard")
  const tStatus = useTranslations("status")

  const statusData = useMemo(
    () => getStatusChartData(items, (s: InventoryStatus) => tStatus(s)),
    [items, tStatus]
  )
  const insights = useMemo(() => getInsights(items), [items])

  // Live delta for the Total card — the only KPI with honest history
  // (createdAt). Status KPIs have no snapshots, so they get no fake trends.
  const addedThisWeek = useMemo(() => {
    // Time-derived value: intentionally frozen per items-change. Staleness of
    // a few minutes is fine for a "+N this week" hint.
    // eslint-disable-next-line react-hooks/purity
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return items.filter((i) => new Date(i.createdAt).getTime() > weekAgo).length
  }, [items])

  if (!hydrated) {
    return (
      <PageContainer size="wide" className="flex flex-col gap-5">
        <ShimmerSkeleton className="h-10 w-48" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-28" />
          ))}
        </div>
        <ShimmerSkeleton className="h-64" />
      </PageContainer>
    )
  }

  return (
    <PageContainer size="wide" className="flex flex-col gap-5 md:gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div variants={staggerItem}>
          <StatCard
            title={t("total")} value={stats.total.toLocaleString()}
            hint={addedThisWeek > 0 ? t("addedThisWeek", { count: addedThisWeek }) : undefined}
            icon={Boxes} href="/inventory" ariaLabel={t("totalAriaLabel")}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title={t("opened")} value={stats.opened.toLocaleString()}
            icon={FolderOpen} index={1} href="/inventory?status=opened" ariaLabel={t("openedAriaLabel")}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title={t("needsAttention")} value={stats.needsAttention.toLocaleString()}
            icon={AlertTriangle} index={2} href="/inventory?status=needsAttention" ariaLabel={t("needsAttentionAriaLabel")}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title={t("categories")} value={stats.categories.toLocaleString()}
            icon={Tags} index={3} href="/analytics" ariaLabel={t("categoriesAriaLabel")}
          />
        </motion.div>
      </motion.div>

      <InsightsWidgets insights={insights} />

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusChart data={statusData} />
        <CategoryChart data={categoryBreakdown} />
      </div>

      <StorageOccupancy data={locationOccupancy.map((s) => ({ location: s.location, count: s.count, pct: s.pct }))} />

      <div className="grid gap-4 lg:grid-cols-2">
        <LowStockAlerts items={lowStockItems} />
        <RecentActivity items={recentItems} />
      </div>
    </PageContainer>
  )
}
