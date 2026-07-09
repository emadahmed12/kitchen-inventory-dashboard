"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { Archive, ArrowLeftRight, Package, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { PageContainer } from "@/components/ui/page-container"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { StorageFormDialog } from "@/components/storage/storage-form-dialog"
import { DeleteStorageDialog } from "@/components/storage/delete-storage-dialog"
import { MoveItemsDialog } from "@/components/storage/move-items-dialog"
import {
  useStorageLocations,
  useStorageActions,
} from "@/hooks/use-storage"
import { useInventoryHydrated, useInventoryItems } from "@/hooks/use-inventory"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import type { StorageLocationInput, StorageType, UserStorageLocation } from "@/types/storage"

const FILTER_TYPES: Array<StorageType | "all"> = [
  "all", "fridge", "freezer", "pantry", "cabinet", "counter", "other",
]

// ── occupancy bar ─────────────────────────────────────────────────────────────

function OccupancyBar({ pct, color, label }: { pct: number; color?: string; label?: string }) {
  const defaultColor =
    pct >= 80
      ? "bg-destructive"
      : pct >= 55
        ? "bg-amber-500"
        : "bg-primary"

  return (
    <div
      className="h-1.5 w-full rounded-full bg-muted/50"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
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
  onMove,
}: {
  location: UserStorageLocation
  items: ReturnType<typeof useInventoryItems>
  onEdit: (l: UserStorageLocation) => void
  onDelete: (l: UserStorageLocation) => void
  onMove: (l: UserStorageLocation) => void
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
              {locationItems.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl opacity-60 hover:opacity-100"
                  onClick={() => onMove(location)}
                  aria-label={t("moveItems")}
                >
                  <ArrowLeftRight className="size-3.5" strokeWidth={1.75} />
                </Button>
              )}
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
      <OccupancyBar pct={pct} color={location.color} label={location.name} />

      {/* Notes */}
      {location.notes && (
        <p className="text-xs italic text-muted-foreground/80 line-clamp-2">
          {location.notes}
        </p>
      )}

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
  const { create, update, remove, moveItems, isSaving, isDeleting } = useStorageActions()

  const [formOpen, setFormOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<UserStorageLocation | null>(null)
  const [deletingLocation, setDeletingLocation] = useState<UserStorageLocation | null>(null)
  const [movingLocation, setMovingLocation] = useState<UserStorageLocation | null>(null)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<StorageType | "all">("all")

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase()
    return locations.filter((l) => {
      if (typeFilter !== "all" && l.type !== typeFilter) return false
      if (q && !l.name.toLowerCase().includes(q) && !l.notes?.toLowerCase().includes(q)) return false
      return true
    })
  }, [locations, search, typeFilter])

  const movingItems = useMemo(
    () => (movingLocation ? items.filter((i) => i.location === movingLocation.id) : []),
    [items, movingLocation]
  )

  async function handleMoveConfirm(itemIds: string[], targetId: string) {
    const ok = await moveItems(itemIds, targetId)
    if (ok) toast.success(t("moveSuccess", { count: itemIds.length }))
    return ok
  }

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

      {/* Search + type filter */}
      {locations.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="rounded-xl ps-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_TYPES.map((tp) => (
              <button
                key={tp}
                onClick={() => setTypeFilter(tp)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  typeFilter === tp
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {tp === "all" ? t("filterAll") : t(`types.${tp}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {locations.length === 0 ? (
        <EmptyState
          icon={Archive}
          title={t("allEmpty")}
          description={t("allEmptyDesc")}
          action={
            SUPABASE_ENABLED ? (
              <Button onClick={() => setFormOpen(true)} className="gap-2 rounded-xl">
                <Plus className="size-4" strokeWidth={2} />
                {t("addLocation")}
              </Button>
            ) : undefined
          }
        />
      ) : filteredLocations.length === 0 ? (
        <EmptyState icon={Search} title={t("noResults")} className="py-14" />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid gap-4 sm:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {filteredLocations.map((loc) => (
              <StorageCard
                key={loc.id}
                location={loc}
                items={items}
                onEdit={handleEdit}
                onDelete={setDeletingLocation}
                onMove={setMovingLocation}
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

      <MoveItemsDialog
        open={Boolean(movingLocation)}
        onOpenChange={(open) => !open && setMovingLocation(null)}
        sourceLocation={movingLocation}
        items={movingItems}
        locations={locations}
        onConfirm={handleMoveConfirm}
      />
    </PageContainer>
  )
}
