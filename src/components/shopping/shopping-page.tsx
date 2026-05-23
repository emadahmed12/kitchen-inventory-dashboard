"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, CheckCircle2, Circle, ShoppingBag } from "lucide-react"

import { PageContainer } from "@/components/ui/page-container"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useInventoryHydrated, useInventoryItems } from "@/hooks/use-inventory"
import { needsAttention } from "@/lib/inventory/status"
import { staggerContainer, staggerItem } from "@/lib/motion"
import type { InventoryItem } from "@/types/inventory"

function StatusBadge({ status, t }: { status: InventoryItem["status"]; t: ReturnType<typeof useTranslations> }) {
  if (status === "almost_finished") {
    return (
      <Badge variant="destructive" className="rounded-lg text-[0.65rem]">
        {t("statusAlmost")}
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="rounded-lg text-[0.65rem] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">
      {t("statusLow")}
    </Badge>
  )
}

export function ShoppingPage() {
  const t = useTranslations("shopping")
  const hydrated = useInventoryHydrated()
  const items = useInventoryItems()
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const needsRestock = useMemo(
    () => items.filter(needsAttention).sort((a, b) => {
      // almost_finished first, then low
      if (a.status === "almost_finished" && b.status !== "almost_finished") return -1
      if (b.status === "almost_finished" && a.status !== "almost_finished") return 1
      return a.name.localeCompare(b.name)
    }),
    [items]
  )

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function uncheckAll() {
    setChecked(new Set())
  }

  if (!hydrated) {
    return (
      <PageContainer size="wide" className="flex flex-col gap-5">
        <ShimmerSkeleton className="h-10 w-56" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="default" className="flex flex-col gap-5 md:gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      {needsRestock.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 bg-muted/15 px-6 py-24 text-center"
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <ShoppingCart className="size-7 text-emerald-500" strokeWidth={1.25} />
          </div>
          <p className="text-base font-semibold">{t("noItems")}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("noItemsDesc")}</p>
        </motion.div>
      ) : (
        <>
          {/* Header row */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("totalNeeded", { count: needsRestock.length })}
            </p>
            {checked.size > 0 && (
              <Button variant="ghost" size="sm" onClick={uncheckAll} className="text-xs h-7 rounded-lg">
                {t("uncheckAll")}
              </Button>
            )}
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3"
          >
            <AnimatePresence mode="popLayout">
              {needsRestock.map((item) => {
                const isChecked = checked.has(item.id)
                const suggested = Math.max(1, (item.lowStockThreshold + 1) - item.quantity)

                return (
                  <motion.div
                    key={item.id}
                    variants={staggerItem}
                    layout
                    className={`
                      group flex items-center gap-4 rounded-2xl border px-4 py-3.5
                      transition-all duration-200 cursor-pointer select-none
                      ${isChecked
                        ? "border-border/30 bg-muted/20 opacity-55"
                        : "border-border/50 bg-card hover:border-border hover:bg-card/80"
                      }
                    `}
                    onClick={() => toggleCheck(item.id)}
                  >
                    {/* Checkbox icon */}
                    <span className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
                      {isChecked
                        ? <CheckCircle2 className="size-5 text-primary" />
                        : <Circle className="size-5" />
                      }
                    </span>

                    {/* Item info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`truncate text-sm font-medium ${isChecked ? "line-through text-muted-foreground" : ""}`}>
                          {item.name}
                        </span>
                        <StatusBadge status={item.status} t={t} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t("currentQty")}: {item.quantity} {item.unit} · {t("suggested")}: {suggested} {item.unit}
                      </p>
                    </div>

                    {/* Shopping bag icon */}
                    <ShoppingBag
                      className={`shrink-0 size-4 transition-colors ${isChecked ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"}`}
                      strokeWidth={1.5}
                    />
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>

          {/* Checked summary */}
          {checked.size > 0 && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-xs text-muted-foreground"
            >
              {t("checkedOff")}: {checked.size} / {needsRestock.length}
            </motion.p>
          )}
        </>
      )}
    </PageContainer>
  )
}
