"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Boxes, FolderOpen, Tags } from "lucide-react"

import { cn } from "@/lib/utils"

type InventoryStatsProps = {
  total: number
  opened: number
  low: number
  categories: number
}

const cards = [
  {
    key: "total",
    title: "إجمالي المنتجات",
    icon: Boxes,
    getValue: (s: InventoryStatsProps) => s.total.toLocaleString("ar-EG"),
    accent: "from-emerald-500/10 to-transparent",
  },
  {
    key: "opened",
    title: "المنتجات المفتوحة",
    icon: FolderOpen,
    getValue: (s: InventoryStatsProps) => s.opened.toLocaleString("ar-EG"),
    accent: "from-amber-500/10 to-transparent",
  },
  {
    key: "low",
    title: "مخزون منخفض",
    icon: AlertTriangle,
    getValue: (s: InventoryStatsProps) => s.low.toLocaleString("ar-EG"),
    accent: "from-red-500/10 to-transparent",
  },
  {
    key: "categories",
    title: "الفئات",
    icon: Tags,
    getValue: (s: InventoryStatsProps) => s.categories.toLocaleString("ar-EG"),
    accent: "from-violet-500/10 to-transparent",
  },
] as const

export function InventoryStats(props: InventoryStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "glass-card relative overflow-hidden rounded-2xl p-4",
              "bg-gradient-to-br",
              card.accent
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                  {card.getValue(props)}
                </p>
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
