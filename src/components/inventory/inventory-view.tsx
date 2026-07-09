"use client"

import { AnimatePresence, motion } from "framer-motion"
import { PackageOpen } from "lucide-react"
import { useTranslations } from "next-intl"

import { InventoryCard } from "@/components/inventory/inventory-card"
import { InventoryListRow } from "@/components/inventory/inventory-list-row"
import { EmptyState } from "@/components/ui/empty-state"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import type { InventoryItem } from "@/types/inventory"
import type { ViewMode } from "@/types/ui"

type InventoryViewProps = {
  items: InventoryItem[]
  view: ViewMode
  hydrated: boolean
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  onQuantityChange: (id: string, quantity: number) => void
}

export function InventoryView({
  items,
  view,
  hydrated,
  onEdit,
  onDelete,
  onQuantityChange,
}: InventoryViewProps) {
  const t = useTranslations("inventory")

  if (!hydrated) {
    return <InventorySkeleton view={view} />
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={t("emptyTitle")}
        description={t("emptyDesc")}
      />
    )
  }

  return (
    <AnimatePresence mode="popLayout">
      {view === "grid" ? (
        <motion.div
          key="grid"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <InventoryCard
                key={item.id}
                item={item}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          key="list"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-2.5"
        >
          <AnimatePresence mode="popLayout">
            {items.map((item, index) => (
              <InventoryListRow
                key={item.id}
                item={item}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function InventorySkeleton({ view }: { view: ViewMode }) {
  if (view === "list") {
    return (
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <ShimmerSkeleton key={i} className="h-[4.5rem] rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ShimmerSkeleton key={i} className="min-h-[13.5rem] rounded-3xl" />
      ))}
    </div>
  )
}
