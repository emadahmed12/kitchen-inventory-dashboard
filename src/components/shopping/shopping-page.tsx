"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  AlertTriangle,
  CheckCircle2,
  ListPlus,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react"

import { PageContainer } from "@/components/ui/page-container"
import { EmptyState } from "@/components/ui/empty-state"
import { ShimmerSkeleton } from "@/components/ui/shimmer-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingItemCard } from "@/components/shopping/shopping-item-card"
import { ReviewDialog } from "@/components/shopping/review-dialog"
import { useInventoryHydrated, useInventoryItems } from "@/hooks/use-inventory"
import { useShoppingSession } from "@/hooks/use-shopping-session"
import { useInventoryStore } from "@/store/inventory-store"
import { needsAttention } from "@/lib/inventory/status"
import { staggerContainer, staggerItem } from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { ShoppingListItem } from "@/types/shopping"

// ── Progress Bar ──────────────────────────────────────────────────────────────

function SessionProgressBar({ purchased, partial, skipped, total }: {
  purchased: number; partial: number; skipped: number; total: number
}) {
  const t = useTranslations("shopping.progress")
  const pctDone = total === 0 ? 0 : Math.round(((purchased + partial * 0.5) / total) * 100)

  return (
    <div className="rounded-2xl border border-border/50 bg-card px-4 py-3 space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold">{t("title")}</span>
        <span>{t("of", { done: purchased + partial, total })}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden" role="progressbar" aria-valuenow={pctDone} aria-valuemin={0} aria-valuemax={100} aria-label={t("title")}>
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pctDone}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex gap-3 text-xs flex-wrap">
        {purchased > 0 && (
          <span className="text-emerald-500">{t("purchased", { count: purchased })}</span>
        )}
        {partial > 0 && (
          <span className="text-amber-500">{t("partial", { count: partial })}</span>
        )}
        {skipped > 0 && (
          <span className="text-muted-foreground">{t("skipped", { count: skipped })}</span>
        )}
        {(total - purchased - partial - skipped) > 0 && (
          <span className="text-muted-foreground">{t("remaining", { count: total - purchased - partial - skipped })}</span>
        )}
      </div>
    </div>
  )
}

// ── Pre-session: list management ──────────────────────────────────────────────

function PreSessionView() {
  const t = useTranslations("shopping")
  const {
    listItems, addToList, removeFromList, updateListItemQty,
    clearList, replaceAutoDetected, startSession,
  } = useShoppingSession()

  const [addFormOpen, setAddFormOpen] = useState(false)
  const [manualName, setManualName] = useState("")
  const [manualQty, setManualQty] = useState(1)
  const [manualUnit, setManualUnit] = useState("bag")

  // Sync auto-detected items whenever inventory changes
  const allItems = useInventoryItems()
  const autoItems = useMemo(
    () => allItems.filter(needsAttention).map((item) => ({
      inventoryItemId: item.id,
      name: item.name,
      unit: item.unit,
      neededQty: Math.max(1, (item.lowStockThreshold + 1) - item.quantity),
      currentStock: item.quantity,
      isAutoDetected: true,
    })),
    [allItems]
  )

  useEffect(() => {
    replaceAutoDetected(autoItems)
  // replaceAutoDetected is a stable Zustand action — omitting from deps is safe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoItems])

  function handleAddManual(e: React.FormEvent) {
    e.preventDefault()
    if (!manualName.trim()) return
    addToList({
      name: manualName.trim(),
      unit: manualUnit,
      neededQty: manualQty,
      currentStock: 0,
      isAutoDetected: false,
    })
    setManualName("")
    setManualQty(1)
    setAddFormOpen(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header + actions */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {listItems.length > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setAddFormOpen(v => !v)} className="gap-1.5 rounded-xl">
                <ListPlus className="size-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">{t("addManualItem")}</span>
              </Button>
              <Button
                onClick={startSession}
                className="gap-2 rounded-xl"
              >
                <ShoppingCart className="size-4" strokeWidth={2} />
                {t("startShopping")}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Manual add form */}
      <AnimatePresence>
        {addFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddManual}
            className="overflow-hidden"
          >
            <div className="flex gap-2 flex-wrap rounded-2xl border border-border/50 bg-card p-4">
              <Input
                placeholder={t("manualItemName")}
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="rounded-xl flex-1 min-w-[140px]"
                required
                autoFocus
              />
              <Input
                type="number"
                placeholder={t("manualItemQty")}
                value={manualQty}
                onChange={(e) => setManualQty(Math.max(1, Number(e.target.value)))}
                className="rounded-xl w-20"
                min={1}
              />
              <Input
                placeholder={t("manualItemUnit")}
                value={manualUnit}
                onChange={(e) => setManualUnit(e.target.value)}
                className="rounded-xl w-20"
              />
              <Button type="submit" className="rounded-xl gap-1.5">
                <Plus className="size-4" strokeWidth={2} />
                {t("addItem")}
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" className="rounded-xl" onClick={() => setAddFormOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {listItems.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          tone="success"
          title={t("emptyList")}
          description={t("emptyListDesc")}
          action={
            <Button onClick={() => setAddFormOpen(true)} variant="outline" className="gap-2 rounded-xl">
              <Plus className="size-4" strokeWidth={2} />
              {t("addManualItem")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("listCount", { count: listItems.length })}
            </p>
            <Button variant="ghost" size="sm" onClick={clearList} className="text-xs gap-1 rounded-xl text-muted-foreground">
              <Trash2 className="size-3.5" strokeWidth={1.75} />
              {t("clearList")}
            </Button>
          </div>

          <motion.ul variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {listItems.map((item) => (
                <PreSessionItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeFromList(item.id)}
                  onQtyChange={(qty) => updateListItemQty(item.id, qty)}
                />
              ))}
            </AnimatePresence>
          </motion.ul>

          <Button onClick={startSession} size="lg" className="gap-2 rounded-2xl w-full mt-2">
            <ShoppingCart className="size-5" strokeWidth={2} />
            {t("startShopping")} ({listItems.length})
          </Button>
        </>
      )}
    </div>
  )
}

function PreSessionItem({
  item,
  onRemove,
  onQtyChange,
}: {
  item: ShoppingListItem
  onRemove: () => void
  onQtyChange: (qty: number) => void
}) {
  const t = useTranslations("shopping")
  return (
    <motion.li
      layout
      variants={staggerItem}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
        item.isAutoDetected
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-border/50 bg-card"
      )}
    >
      {item.isAutoDetected ? (
        <AlertTriangle className="size-4 shrink-0 text-amber-500" strokeWidth={1.75} />
      ) : (
        <ShoppingBag className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">
          {t("currentStock")}: {item.currentStock} {item.unit}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onQtyChange(item.neededQty - 1)}
          disabled={item.neededQty <= 1}
          aria-label={t("quickActions.add1")}
          className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Minus className="size-3.5" strokeWidth={2} />
        </button>
        <span className="w-7 text-center text-sm font-semibold tabular-nums">{item.neededQty}</span>
        <button
          onClick={() => onQtyChange(item.neededQty + 1)}
          aria-label={t("quickActions.add1")}
          className="flex size-10 items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="size-3.5" strokeWidth={2} />
        </button>
        <span className="text-xs text-muted-foreground w-6">{item.unit}</span>
      </div>
      <button
        onClick={onRemove}
        className="ms-1 flex size-10 items-center justify-center rounded-xl text-muted-foreground hover:text-destructive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("removeFromList")}
      >
        <X className="size-4" strokeWidth={1.75} />
      </button>
    </motion.li>
  )
}

// ── Session view ──────────────────────────────────────────────────────────────

function SessionView() {
  const t = useTranslations("shopping")
  const {
    session, progress, inventoryUpdates,
    addManualItem, setBoughtQty, setItemState, markAllPurchased,
    finishSession, cancelSession,
  } = useShoppingSession()
  // Apply bought quantities directly to the inventory store
  const inventoryStore = useInventoryStore.getState

  const [reviewOpen, setReviewOpen] = useState(false)
  const [addFormOpen, setAddFormOpen] = useState(false)
  const [manualName, setManualName] = useState("")
  const [manualQty, setManualQty] = useState(1)
  const [manualUnit, setManualUnit] = useState("bag")

  if (!session || !progress) return null

  function handleFinish() {
    setReviewOpen(true)
  }

  function handleApplyChanges() {
    // Apply inventory updates via the store's synchronous action
    const { updateQuantity } = inventoryStore()
    for (const update of inventoryUpdates) {
      updateQuantity(update.inventoryItemId, update.newStock)
    }
    finishSession()
    toast.success(t("review.applied"))
    setReviewOpen(false)
  }

  function handleAddManual(e: React.FormEvent) {
    e.preventDefault()
    if (!manualName.trim()) return
    addManualItem(manualName.trim(), manualUnit, manualQty)
    setManualName("")
    setManualQty(1)
    setAddFormOpen(false)
  }

  const pending = session.items.filter((i) => i.state === "pending" || i.state === "partial")
  const done = session.items.filter((i) => i.state === "purchased" || i.state === "skipped")

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{t("title")}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="sm"
            className="gap-1.5 rounded-xl text-muted-foreground text-xs"
            onClick={cancelSession}
          >
            <X className="size-3.5" strokeWidth={1.75} />
            {t("cancelSession")}
          </Button>
        </div>
      </div>

      {/* Progress */}
      <SessionProgressBar
        purchased={progress.purchased}
        partial={progress.partial}
        skipped={progress.skipped}
        total={progress.total}
      />

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={() => setAddFormOpen(v => !v)}>
          <Plus className="size-3.5" strokeWidth={2} />
          {t("addManualItem")}
        </Button>
        {pending.length > 0 && (
          <Button variant="outline" size="sm" className="gap-1.5 rounded-xl" onClick={markAllPurchased}>
            <CheckCircle2 className="size-3.5" strokeWidth={2} />
            {t("markAllDone")}
          </Button>
        )}
      </div>

      {/* Manual add form */}
      <AnimatePresence>
        {addFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddManual}
            className="overflow-hidden"
          >
            <div className="flex gap-2 flex-wrap rounded-2xl border border-border/50 bg-card p-4">
              <Input
                placeholder={t("manualItemName")}
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                className="rounded-xl flex-1 min-w-[140px]"
                required autoFocus
              />
              <Input
                type="number" min={1}
                placeholder={t("manualItemQty")}
                value={manualQty}
                onChange={(e) => setManualQty(Math.max(1, Number(e.target.value)))}
                className="rounded-xl w-20"
              />
              <Input
                placeholder={t("manualItemUnit")}
                value={manualUnit}
                onChange={(e) => setManualUnit(e.target.value)}
                className="rounded-xl w-20"
              />
              <Button type="submit" className="rounded-xl">
                <Plus className="size-4" strokeWidth={2} />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" className="rounded-xl" onClick={() => setAddFormOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Pending items */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-3">
          {pending.map((item) => (
            <ShoppingItemCard
              key={item.id}
              item={item}
              onBoughtQtyChange={setBoughtQty}
              onStateChange={setItemState}
            />
          ))}
        </div>
      )}

      {/* Done items (collapsed section) */}
      {done.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground px-1">
            {t("states.purchased")} + {t("states.skipped")} ({done.length})
          </p>
          <div className="flex flex-col gap-2">
            {done.map((item) => (
              <ShoppingItemCard
                key={item.id}
                item={item}
                onBoughtQtyChange={setBoughtQty}
                onStateChange={setItemState}
              />
            ))}
          </div>
        </div>
      )}

      {/* Finish button */}
      <Button
        onClick={handleFinish}
        size="lg"
        className="gap-2 rounded-2xl w-full mt-2"
      >
        <CheckCircle2 className="size-5" strokeWidth={2} />
        {t("finishShopping")}
      </Button>

      {/* Review dialog */}
      {reviewOpen && session && (
        <ReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          session={session}
          updates={inventoryUpdates}
          onConfirm={handleApplyChanges}
        />
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function ShoppingPage() {
  const hydrated = useInventoryHydrated()
  const { isSessionActive } = useShoppingSession()

  if (!hydrated) {
    return (
      <PageContainer size="default" className="flex flex-col gap-5">
        <ShimmerSkeleton className="h-10 w-56" />
        {Array.from({ length: 4 }).map((_, i) => (
          <ShimmerSkeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </PageContainer>
    )
  }

  return (
    <PageContainer size="default" className="flex flex-col gap-5 md:gap-6 pb-20">
      <AnimatePresence mode="wait" initial={false}>
        {isSessionActive ? (
          <motion.div
            key="session"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <SessionView />
          </motion.div>
        ) : (
          <motion.div
            key="pre"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            <PreSessionView />
          </motion.div>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
