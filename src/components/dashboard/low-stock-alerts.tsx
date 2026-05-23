"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { AlertTriangle, ChevronLeft } from "lucide-react"

import { STATUS_COLORS, STATUS_LABELS } from "@/lib/inventory/constants"
import type { InventoryItem } from "@/types/inventory"
import { cn } from "@/lib/utils"

type LowStockAlertsProps = {
  items: InventoryItem[]
}

export function LowStockAlerts({ items }: LowStockAlertsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-xl bg-red-500/10">
            <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">تنبيهات المخزون</h3>
            <p className="text-xs text-muted-foreground">يحتاج انتباهك</p>
          </div>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          عرض الكل
          <ChevronLeft className="size-3.5" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-muted/30 px-4 py-6 text-center text-xs text-muted-foreground">
          لا توجد تنبيهات حالياً — مخزونك ممتاز.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => {
            const colors = STATUS_COLORS[item.status]
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href="/inventory"
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                    "hover:bg-muted/50 active:scale-[0.99]",
                    colors.glow
                  )}
                >
                  <span
                    className={cn("size-2 shrink-0 rounded-full", colors.dot)}
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {item.name}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1",
                      colors.badge
                    )}
                  >
                    {STATUS_LABELS[item.status]}
                  </span>
                </Link>
              </motion.li>
            )
          })}
        </ul>
      )}
    </motion.div>
  )
}
