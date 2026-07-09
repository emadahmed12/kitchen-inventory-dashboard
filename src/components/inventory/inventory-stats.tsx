"use client"

import { useTranslations } from "next-intl"
import { AlertTriangle, Boxes, FolderOpen, Tags } from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"

type InventoryStatsProps = { total: number; opened: number; low: number; categories: number }

/**
 * Inventory page stat row — reuses the dashboard StatCard so the same data
 * gets the same visual treatment everywhere.
 */
export function InventoryStats(props: InventoryStatsProps) {
  const t = useTranslations("inventory")

  const cards = [
    { key: "total", title: t("statTotal"), icon: Boxes, value: props.total },
    { key: "opened", title: t("statOpened"), icon: FolderOpen, value: props.opened },
    { key: "low", title: t("statLow"), icon: AlertTriangle, value: props.low },
    { key: "categories", title: t("statCategories"), icon: Tags, value: props.categories },
  ] as const

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <StatCard
          key={card.key}
          title={card.title}
          value={card.value.toLocaleString()}
          icon={card.icon}
          index={index}
        />
      ))}
    </div>
  )
}
