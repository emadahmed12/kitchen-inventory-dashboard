"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { AlertTriangle, Boxes, FolderOpen, Tags } from "lucide-react"

import { cn } from "@/lib/utils"

type InventoryStatsProps = { total: number; opened: number; low: number; categories: number }

export function InventoryStats(props: InventoryStatsProps) {
  const t = useTranslations("inventory")

  const cards = [
    { key: "total", title: t("statTotal"), icon: Boxes, value: props.total, accent: "from-emerald-500/10 to-transparent" },
    { key: "opened", title: t("statOpened"), icon: FolderOpen, value: props.opened, accent: "from-amber-500/10 to-transparent" },
    { key: "low", title: t("statLow"), icon: AlertTriangle, value: props.low, accent: "from-red-500/10 to-transparent" },
    { key: "categories", title: t("statCategories"), icon: Tags, value: props.categories, accent: "from-violet-500/10 to-transparent" },
  ] as const

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn("glass-card relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br", card.accent)}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{card.value.toLocaleString()}</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-foreground/[0.06]">
                <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
