"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Archive, Package } from "lucide-react"

import { PageContainer } from "@/components/ui/page-container"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { useInventoryHydrated, useInventoryItems } from "@/hooks/use-inventory"
import { STORAGE_LOCATIONS } from "@/data/catalog"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"

function OccupancyBar({ pct }: { pct: number }) {
  const color =
    pct >= 80
      ? "bg-destructive"
      : pct >= 55
        ? "bg-amber-500"
        : "bg-primary"

  return (
    <div className="h-1.5 w-full rounded-full bg-muted/50">
      <motion.div
        className={cn("h-full rounded-full", color)}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

export function StoragePage() {
  const t = useTranslations("storage")
  const tCatalog = useTranslations("catalog")
  const hydrated = useInventoryHydrated()
  const items = useInventoryItems()

  const locationData = useMemo(() =>
    STORAGE_LOCATIONS.map((loc) => {
      const locationItems = items.filter((item) => item.location === loc.id)
      const pct = Math.min(100, Math.round((locationItems.length / loc.capacity) * 100))
      return {
        id: loc.id,
        label: tCatalog(`locations.${loc.id}` as `locations.${typeof loc.id}`),
        count: locationItems.length,
        capacity: loc.capacity,
        pct,
        items: locationItems,
      }
    }),
    [items, tCatalog]
  )

  if (!hydrated) {
    return (
      <PageContainer size="wide" className="flex flex-col gap-5">
        <ShimmerSkeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-52 rounded-3xl" />
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer size="wide" className="flex flex-col gap-5 md:gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2"
      >
        {locationData.map((loc) => (
          <motion.div
            key={loc.id}
            variants={staggerItem}
            className="rounded-3xl border border-border/50 bg-card p-5 flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/40">
                  <Archive className="size-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{loc.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("capacity", { count: loc.capacity })}
                  </p>
                </div>
              </div>
              <span className={cn(
                "text-xs font-medium tabular-nums",
                loc.pct >= 80 ? "text-destructive" : loc.pct >= 55 ? "text-amber-500" : "text-muted-foreground"
              )}>
                {loc.pct}%
              </span>
            </div>

            {/* Occupancy bar */}
            <OccupancyBar pct={loc.pct} />

            {/* Item count */}
            <p className="text-xs text-muted-foreground">
              {loc.count === 0 ? t("empty") : t("items", { count: loc.count })}
            </p>

            {/* Item list (up to 5) */}
            {loc.items.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {loc.items.slice(0, 5).map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 bg-muted/30 text-xs"
                  >
                    <Package className="size-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="ms-auto shrink-0 tabular-nums text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                  </li>
                ))}
                {loc.items.length > 5 && (
                  <li className="px-2 py-1 text-xs text-muted-foreground text-center">
                    +{loc.items.length - 5}
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-xs italic text-muted-foreground/60">{t("noItems")}</p>
            )}
          </motion.div>
        ))}
      </motion.div>
    </PageContainer>
  )
}
