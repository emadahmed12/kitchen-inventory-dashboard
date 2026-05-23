"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Activity, CheckCircle2, AlertTriangle, FolderOpen, Package } from "lucide-react"

import { CategoryChart } from "@/components/dashboard/category-chart"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusChart } from "@/components/dashboard/status-chart"
import { StorageOccupancy } from "@/components/dashboard/storage-occupancy"
import { PageContainer } from "@/components/ui/page-container"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { useInventoryHydrated, useInventoryItems } from "@/hooks/use-inventory"
import { useInventoryStats } from "@/hooks/use-inventory-stats"
import { getStatusChartData } from "@/lib/dashboard/analytics"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { InventoryStatus } from "@/types/inventory"

export function AnalyticsPage() {
  const t = useTranslations("analytics")
  const tStatus = useTranslations("status")
  const hydrated = useInventoryHydrated()
  const items = useInventoryItems()
  const { stats, categoryBreakdown, locationOccupancy, lowStockItems, recentItems } =
    useInventoryStats()

  const statusData = useMemo(
    () => getStatusChartData(items, (s: InventoryStatus) => tStatus(s)),
    [items, tStatus]
  )

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

      {/* Overview stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
      >
        <motion.div variants={staggerItem}>
          <StatCard title={t("totalItems")} value={stats.total.toLocaleString()} icon={Package} index={0} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard title={t("healthyItems")} value={stats.healthy.toLocaleString()} icon={CheckCircle2} index={1} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard title={t("attentionItems")} value={stats.needsAttention.toLocaleString()} icon={AlertTriangle} index={2} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard title={t("openedItems")} value={stats.opened.toLocaleString()} icon={FolderOpen} index={3} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard title={t("totalQty")} value={stats.totalQuantity.toLocaleString()} icon={Activity} index={4} />
        </motion.div>
      </motion.div>

      {/* Distribution charts */}
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
