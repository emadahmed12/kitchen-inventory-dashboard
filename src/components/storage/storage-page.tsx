"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { Archive, Package, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { PageContainer } from "@/components/ui/page-container"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StorageFormDialog } from "@/components/storage/storage-form-dialog"
import { DeleteStorageDialog } from "@/components/storage/delete-storage-dialog"
import {
  useStorageLocations,
  useStorageActions,
} from "@/hooks/use-storage"
import { useInventoryHydrated, useInventoryItems } from "@/hooks/use-inventory"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import type { StorageLocationInput, UserStorageLocation } from "@/types/storage"

// ── occupancy bar ─────────────────────────────────────────────────────────────

function OccupancyBar({ pct, color }: { pct: number; color?: string }) {
  const defaultColor =
    pct >= 80
      ? "bg-destructive"
      : pct >= 55
        ? "bg-amber-500"
        : "bg-primary"

  return (
    <div className="h-1.5 w-full rounded-full bg-muted/50">
      <motion.div
        className={cn("h-full rounded-full", !color && defaultColor)}
        style={color ? { background: color } : undefined}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  )
}

// ── storage card ──────────────────────────────────────────────────────────────

function StorageCard({
  location,
  items,
  onEdit,
  onDelete,
}: {
  location: UserStorageLocation
  items: ReturnType<typeof useInventoryItems>
  onEdit: (l: UserStorageLocation) => void
  onDelete: (l: UserStorageLocation) => void
}) {
  const t = useTranslations("storage")
  const locationItems = items.filter((i) => i.location === location.id)
  const pct = Math.min(
    100,
    Math.round((locationItems.length / location.capacity) * 100)
  )

  return (
    <motion.div
      layout
      variants={staggerItem}
      className="rounded-3xl border border-border/50 bg-card p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/40"
            style={location.color ? { background: location.color + "22" } : undefined}
          >
            <Archive
              className="size-4"
              style={location.color ? { color: location.color } : { color: "var(--muted-foreground)" }}
              strokeWidth={1.5}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-semibold text-sm truncate">{location.name}</p>
              {location.isDefault && (
                <Badge
                  variant="secondary"
                  className="text-[0.6rem] h-4 rounded-md border-0 bg-muted/60 px-1.5"
                >
                  {t("defaultBadge")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("capacity", { count: location.capacity })}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              pct >= 80
                ? "text-destructive"
                : pct >= 55
                  ? "text-amber-500"
                  : "text-muted-foreground"
            )}
          >
            {pct}%
          </span>
          {SUPABASE_ENABLED && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-xl opacity-60 hover:opacity-100"
                onClick={() => onEdit(location)}
                aria-label={t("editLocation")}
              >
                <Pencil className="size-3.5" strokeWidth={1.75} />
              </Button>
              {!location.isDefault && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl opacity-60 hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={() => onDelete(location)}
                  aria-label={t("deleteLocation")}
                >
                  <Trash2 className="size-3.5" strokeWidth={1.75} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Occupancy bar */}
      <OccupancyBar pct={pct} color={location.color} />

      {/* Item count */}
      <p className="text-xs text-muted-foreground">
        {locationItems.length === 0
          ? t("empty")
          : t("items", { count: locationItems.length })}
      </p>

      {/* Item list (top 5) */}
      {locationItems.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {locationItems.slice(0, 5).map((item) => (
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
          {locationItems.length > 5 && (
            <li className="px-2 py-1 text-xs text-muted-foreground text-center">
              +{locationItems.length - 5}
            </li>
          )}
        </ul>
      )}
    </motion.div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────

export function StoragePage() {
  const t = useTranslations("storage")
  const hydrated = useInventoryHydrated()
  const items = useInventoryItems()
  const locations = useStorageLocations()
  const { create, update, remove, isSaving, isDeleting } = useStorageActions()

  const [formOpen, setFormOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<UserStorageLocation | null>(null)
  const [deletingLocation, setDeletingLocation] = useState<UserStorageLocation | null>(null)

  function handleEdit(location: UserStorageLocation) {
    setEditingLocation(location)
    setFormOpen(true)
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingLocation(null)
  }

  async function handleFormSubmit(data: StorageLocationInput) {
    if (editingLocation) {
      const ok = await update(editingLocation.id, data)
      if (ok) toast.success(t("editLocation"))
    } else {
      const loc = await create(data)
      if (loc) toast.success(t("addLocation"))
    }
  }

  async function handleDeleteConfirm() {
    if (!deletingLocation) return
    const ok = await remove(deletingLocation.id)
    if (ok) {
      toast.success(t("deleteLocation"))
      setDeletingLocation(null)
    }
  }

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {SUPABASE_ENABLED && (
          <Button
            onClick={() => { setEditingLocation(null); setFormOpen(true) }}
            className="gap-2 rounded-xl shrink-0"
          >
            <Plus className="size-4" strokeWidth={2} />
            <span className="hidden sm:inline">{t("addLocation")}</span>
          </Button>
        )}
      </motion.div>

      {/* Offline note */}
      {!SUPABASE_ENABLED && (
        <p className="text-xs text-muted-foreground/70 italic">{t("offlineNote")}</p>
      )}

      {/* Empty state */}
      {locations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 bg-muted/15 px-6 py-24 text-center"
        >
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted/40 ring-1 ring-foreground/[0.06]">
            <Archive className="size-7 text-muted-foreground" strokeWidth={1.25} />
          </div>
          <p className="text-base font-semibold">{t("allEmpty")}</p>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{t("allEmptyDesc")}</p>
          {SUPABASE_ENABLED && (
            <Button
              onClick={() => setFormOpen(true)}
              className="mt-5 gap-2 rounded-xl"
            >
              <Plus className="size-4" strokeWidth={2} />
              {t("addLocation")}
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {locations.map((loc) => (
              <StorageCard
                key={loc.id}
                location={loc}
                items={items}
                onEdit={handleEdit}
                onDelete={setDeletingLocation}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Dialogs */}
      <StorageFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        location={editingLocation}
        onSubmit={handleFormSubmit}
        isSaving={isSaving}
      />

      <DeleteStorageDialog
        location={deletingLocation}
        open={Boolean(deletingLocation)}
        onOpenChange={(open) => !open && setDeletingLocation(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </PageContainer>
  )
}
