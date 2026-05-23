"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

type CategoryChartProps = {
  data: { name: string; value: number }[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  const t = useTranslations("categoryChart")

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="glass-card rounded-3xl p-5"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{t("title")}</h3>
        <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: "oklch(0.5 0 0 / 6%)" }} contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
            <Bar dataKey="value" fill="oklch(0.55 0.08 265)" radius={[0, 8, 8, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
