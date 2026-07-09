"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Warehouse } from "lucide-react"

import { cn } from "@/lib/utils"

type StorageItem = { location: string; count: number; pct: number }

export function StorageOccupancy({ data }: { data: StorageItem[] }) {
  const t = useTranslations("storageOccupancy")

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-xl bg-muted/60">
          <Warehouse className="size-4 text-muted-foreground" />
        </span>
        <div>
          <h3 className="text-sm font-semibold">{t("title")}</h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((item, i) => (
          <motion.div
            key={item.location}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl bg-muted/25 p-3 ring-1 ring-foreground/[0.04]"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="truncate text-xs font-medium">{item.location}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {t("items", { count: item.count })}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={item.pct} aria-valuemin={0} aria-valuemax={100} aria-label={item.location}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={cn("h-full rounded-full", item.pct > 75 ? "bg-amber-500" : item.pct > 50 ? "bg-primary/70" : "bg-emerald-500")}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground tabular-nums">
              {t("fullPercent", { pct: item.pct })}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
