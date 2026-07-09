"use client"

import { useLocale, useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { CategoryId } from "@/types/catalog"

type CategoryChartItem = {
  /** Category id — when present the label is drawn from catalog translations. */
  id?: string
  /** Raw display name (used as fallback when id is absent). */
  name: string
  value: number
}

type CategoryChartProps = {
  data: CategoryChartItem[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  const t = useTranslations("categoryChart")
  const tCatalog = useTranslations("catalog")
  const locale = useLocale()
  const isRTL = locale === "ar"

  /*
   * Translate each bar label through the catalog namespace so the chart
   * shows locale-correct text ("Grains" in English, "حبوب" in Arabic)
   * instead of the hardcoded Arabic strings baked into catalog.ts.
   */
  const chartData = data.map((d) => ({
    name: d.id
      ? tCatalog(`categories.${d.id as CategoryId}`)
      : d.name,
    value: d.value,
  }))

  /*
   * RTL FIX — why `dir="ltr"` is required on the wrapper:
   *
   * Recharts calculates all SVG element positions for a LTR context.
   * When the browser inherits `dir="rtl"` from the page, the SVG text
   * `text-anchor` attribute is effectively mirrored, which places every
   * YAxis label *inside* the chart area instead of outside it.
   *
   * Forcing `dir="ltr"` restores correct anchor behaviour and keeps
   * Recharts' coordinate math intact.
   *
   * For Arabic we additionally move the YAxis to `orientation="right"` so
   * that labels sit on the visual RIGHT (= start of RTL reading direction),
   * and bars extend leftward toward the label — matching Arabic flow.
   */
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

      <div className="h-52" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={
              isRTL
                ? { left: 4, right: 0 }   // YAxis handles its own right padding
                : { left: 4, right: 8 }
            }
          >
            <XAxis type="number" hide />

            <YAxis
              type="category"
              dataKey="name"
              /*
               * Arabic: labels on the RIGHT (RTL visual start).
               * English: labels on the LEFT (LTR default).
               */
              orientation={isRTL ? "right" : "left"}
              /*
               * Arabic labels ("معلبات", "مكرونات") are 3–7 chars but each
               * Arabic glyph is wider than a Latin glyph — 80 px prevents
               * truncation on mobile. English labels ("Canned goods") need
               * the extra pixel budget on the left.
               */
              width={isRTL ? 80 : 80}
              tick={{
                fontSize: 11,
                fill: "var(--muted-foreground)",
                /*
                 * The chart wrapper is dir="ltr" so we must set fontFamily
                 * explicitly to the CSS variable that maps to Cairo in Arabic.
                 * Without this the browser falls back to a system font that
                 * may not render Arabic glyphs correctly.
                 */
                fontFamily: "var(--font-sans)",
              }}
              /*
               * Truncate gracefully: 10 chars covers all catalog labels in
               * both languages with an ellipsis safety net.
               */
              tickFormatter={(value: string) =>
                value.length > 10 ? `${value.slice(0, 9)}…` : value
              }
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "oklch(0.5 0 0 / 6%)" }}
              contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }}
            />

            {/*
             * Bars grow left → right within the plot area in both orientations.
             * radius=[0,8,8,0] rounds the RIGHT end — the visual "tip" of the bar.
             */}
            <Bar
              dataKey="value"
              fill="var(--chart-5)"
              radius={[0, 8, 8, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
