"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Boxes, FolderOpen, Tags } from "lucide-react"

import { CategoryChart } from "@/components/dashboard/category-chart"
import { InsightsWidgets } from "@/components/dashboard/insights-widgets"
import { LowStockAlerts } from "@/components/dashboard/low-stock-alerts"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusChart } from "@/components/dashboard/status-chart"
import { StorageOccupancy } from "@/components/dashboard/storage-occupancy"
import { PageContainer } from "@/components/ui/page-container"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import {
  useInventoryHydrated,
  useInventoryItems,
} from "@/hooks/use-inventory"
import { useInventoryStats } from "@/hooks/use-inventory-stats"
import { getInsights, getStatusChartData } from "@/lib/dashboard/analytics"
import { staggerContainer, staggerItem } from "@/lib/motion"

export function DashboardPage() {
  const hydrated = useInventoryHydrated()
  const items = useInventoryItems()
  const {
    stats,
    categoryBreakdown,
    locationOccupancy,
    lowStockItems,
    recentItems,
  } = useInventoryStats()

  const statusData = useMemo(() => getStatusChartData(items), [items])
  const insights = useMemo(() => getInsights(items), [items])

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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">
          نظرة عامة
        </h1>
        <p className="text-sm text-muted-foreground">
          ملخص ذكي لمخزون مطبخك — محدّث لحظياً.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            title="إجمالي المنتجات"
            value={stats.total.toLocaleString("ar-EG")}
            hint="كل العناصر المسجّلة"
            icon={Boxes}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="المنتجات المفتوحة"
            value={stats.opened.toLocaleString("ar-EG")}
            hint="قيد الاستخدام"
            icon={FolderOpen}
            index={1}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="يحتاج انتباه"
            value={stats.needsAttention.toLocaleString("ar-EG")}
            hint="منخفض أو قارب على الانتهاء"
            icon={AlertTriangle}
            index={2}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="الفئات"
            value={stats.categories.toLocaleString("ar-EG")}
            hint="تصنيفات نشطة"
            icon={Tags}
            index={3}
          />
        </motion.div>
      </motion.div>

      <InsightsWidgets insights={insights} />

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusChart data={statusData} />
        <CategoryChart data={categoryBreakdown} />
      </div>

      <StorageOccupancy
        data={locationOccupancy.map((s) => ({
          location: s.location,
          count: s.count,
          pct: s.pct,
        }))}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <LowStockAlerts items={lowStockItems} />
        <RecentActivity items={recentItems} />
      </div>
    </PageContainer>
  )
}
