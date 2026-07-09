"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { STATUS_COLORS } from "@/lib/inventory/constants"
import type { InventoryStatus } from "@/types/inventory"
import { cn } from "@/lib/utils"

// References the --status-* tokens in globals.css so light/dark values
// stay in sync with the rest of the status system.
const STATUS_CHART_COLORS: Record<InventoryStatus, string> = {
  healthy: "var(--status-healthy)",
  opened: "var(--status-opened)",
  low: "var(--status-low)",
  almost_finished: "var(--status-almost-finished)",
}

type StatusChartProps = {
  data: { name: string; value: number; status: InventoryStatus }[]
}

export function StatusChart({ data }: StatusChartProps) {
  const t = useTranslations("statusChart")
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{t("title")}</h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <span className="text-2xl font-semibold tabular-nums">{total.toLocaleString()}</span>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={3} dataKey="value" stroke="transparent">
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-2 text-xs">
            <span className={cn("size-2 rounded-full", STATUS_COLORS[d.status].dot)} />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="ms-auto font-medium tabular-nums">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
