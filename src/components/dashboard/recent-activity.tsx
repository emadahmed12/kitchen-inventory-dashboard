"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Clock } from "lucide-react"

import { STATUS_COLORS } from "@/lib/inventory/constants"
import type { InventoryItem } from "@/types/inventory"
import { cn } from "@/lib/utils"

type RecentActivityProps = { items: InventoryItem[] }

export function RecentActivity({ items }: RecentActivityProps) {
  const t = useTranslations("activity")

  function formatRelativeTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return t("minutesAgo", { count: mins || 1 })
    const hours = Math.floor(mins / 60)
    if (hours < 24) return t("hoursAgo", { count: hours })
    return t("daysAgo", { count: Math.floor(hours / 24) })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-muted/60">
          <Clock className="size-4 text-muted-foreground" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">{t("title")}</h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <ul className="space-y-3">
        {items.map((item, i) => {
          const colors = STATUS_COLORS[item.status]
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.04 }}
              className="flex items-start gap-3"
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full ring-4", colors.dot, colors.ring)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t("updated")} · {formatRelativeTime(item.updatedAt)}
                </p>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </motion.div>
  )
}
