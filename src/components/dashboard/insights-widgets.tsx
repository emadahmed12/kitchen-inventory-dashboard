"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Lightbulb, Sparkles, TriangleAlert } from "lucide-react"

import type { InsightData } from "@/lib/dashboard/analytics"
import { cn } from "@/lib/utils"

const toneStyles = {
  info: {
    icon: Sparkles,
    bg: "from-blue-500/8 to-transparent",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  warn: {
    icon: TriangleAlert,
    bg: "from-amber-500/10 to-transparent",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  success: {
    icon: Lightbulb,
    bg: "from-emerald-500/10 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
}

export function InsightsWidgets({ insights }: { insights: InsightData[] }) {
  const t = useTranslations("insights")

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, i) => {
        const style = toneStyles[insight.tone]
        const Icon = style.icon
        return (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
            whileHover={{ y: -2 }}
            className={cn("glass-card rounded-2xl bg-gradient-to-br p-4", style.bg)}
          >
            <div className="flex gap-3">
              <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", style.iconBg)}>
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-semibold">{t(`${insight.id}.title`)}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t(`${insight.id}.body`, insight.count !== undefined ? { count: insight.count } : {})}
                </p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
