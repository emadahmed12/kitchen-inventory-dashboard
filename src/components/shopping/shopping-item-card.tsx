"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Check, Minus, Plus, SkipForward, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ShoppingItemState, ShoppingSessionItem } from "@/types/shopping"

type ShoppingItemCardProps = {
  item: ShoppingSessionItem
  onBoughtQtyChange: (id: string, qty: number) => void
  onStateChange: (id: string, state: ShoppingItemState) => void
}

const STATE_STYLES: Record<ShoppingItemState, string> = {
  pending:   "border-border/50 bg-card",
  partial:   "border-amber-500/40 bg-amber-500/5",
  purchased: "border-emerald-500/40 bg-emerald-500/5 opacity-80",
  skipped:   "border-border/30 bg-muted/10 opacity-50",
}

const STATE_BADGE: Record<ShoppingItemState, string> = {
  pending:   "bg-muted/50 text-muted-foreground",
  partial:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  purchased: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  skipped:   "bg-muted/40 text-muted-foreground",
}

export function ShoppingItemCard({
  item,
  onBoughtQtyChange,
  onStateChange,
}: ShoppingItemCardProps) {
  const t = useTranslations("shopping")
  const [editingQty, setEditingQty] = useState(false)
  const [qtyInput, setQtyInput] = useState(String(item.boughtQty))

  function handleQtyInputBlur() {
    const val = Number(qtyInput)
    if (!isNaN(val)) onBoughtQtyChange(item.id, val)
    setEditingQty(false)
  }

  function increment(delta: number) {
    onBoughtQtyChange(item.id, item.boughtQty + delta)
  }

  const remaining = Math.max(0, item.neededQty - item.boughtQty)

  return (
    <motion.div
      layout
      className={cn(
        "rounded-3xl border p-4 transition-all duration-200",
        STATE_STYLES[item.state]
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <p className={cn(
            "text-base font-semibold leading-snug",
            item.state === "purchased" && "line-through text-muted-foreground",
            item.state === "skipped" && "text-muted-foreground"
          )}>
            {item.name}
          </p>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <span className={cn(
              "inline-flex items-center rounded-lg px-2 py-0.5 text-[0.65rem] font-medium",
              STATE_BADGE[item.state]
            )}>
              {t(`states.${item.state}` as `states.${ShoppingItemState}`)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("currentStock")}: {item.currentStock} {item.unit}
            </span>
          </div>
        </div>

        {/* Reset / skip toggle */}
        {item.state === "skipped" ? (
          <Button
            variant="ghost" size="icon-sm"
            className="rounded-xl shrink-0"
            onClick={() => onStateChange(item.id, "pending")}
            aria-label="Restore item"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.75} />
          </Button>
        ) : item.state === "purchased" ? (
          <Button
            variant="ghost" size="icon-sm"
            className="rounded-xl shrink-0 text-emerald-500"
            onClick={() => onStateChange(item.id, "pending")}
            aria-label="Undo purchase"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.75} />
          </Button>
        ) : null}
      </div>

      {/* Quantity progress */}
      {item.state !== "skipped" && (
        <div className="mb-3 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">{t("needed")}: <strong>{item.neededQty} {item.unit}</strong></span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-primary">{t("bought")}: <strong>{item.boughtQty} {item.unit}</strong></span>
          {remaining > 0 && (
            <>
              <span className="text-muted-foreground/50">·</span>
              <span className="text-amber-500">{t("remaining")}: {remaining}</span>
            </>
          )}
        </div>
      )}

      {/* Controls */}
      {item.state !== "skipped" && item.state !== "purchased" && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Decrement */}
          <Button
            variant="outline" size="icon-sm"
            className="rounded-xl h-10 w-10"
            onClick={() => increment(-1)}
            disabled={item.boughtQty <= 0}
            aria-label="Decrease"
          >
            <Minus className="size-3.5" strokeWidth={2} />
          </Button>

          {/* Qty input */}
          {editingQty ? (
            <Input
              type="number"
              value={qtyInput}
              onChange={(e) => setQtyInput(e.target.value)}
              onBlur={handleQtyInputBlur}
              onKeyDown={(e) => e.key === "Enter" && handleQtyInputBlur()}
              autoFocus
              className="h-10 w-16 rounded-xl text-center text-sm font-semibold"
              min={0}
            />
          ) : (
            <button
              onClick={() => { setQtyInput(String(item.boughtQty)); setEditingQty(true) }}
              className="h-10 min-w-[3rem] rounded-xl border border-border/50 bg-muted/30 px-3 text-sm font-semibold tabular-nums hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {item.boughtQty}
            </button>
          )}

          {/* Increment */}
          <Button
            variant="outline" size="icon-sm"
            className="rounded-xl h-10 w-10"
            onClick={() => increment(1)}
            aria-label="Increase by 1"
          >
            <Plus className="size-3.5" strokeWidth={2} />
          </Button>

          {/* +5 quick */}
          <Button
            variant="outline" size="sm"
            className="rounded-xl h-10 text-xs px-3"
            onClick={() => increment(5)}
          >
            {t("quickActions.add5")}
          </Button>

          {/* Mark done */}
          <Button
            variant="default" size="sm"
            className="rounded-xl h-10 text-xs px-3 gap-1 ms-auto"
            onClick={() => onStateChange(item.id, "purchased")}
          >
            <Check className="size-3.5" strokeWidth={2} />
            {t("quickActions.markDone")}
          </Button>

          {/* Skip */}
          <Button
            variant="ghost" size="sm"
            className="rounded-xl h-10 text-xs px-3 gap-1 text-muted-foreground"
            onClick={() => onStateChange(item.id, "skipped")}
          >
            <SkipForward className="size-3.5" strokeWidth={1.75} />
            {t("quickActions.skip")}
          </Button>
        </div>
      )}

      {/* Purchased big button */}
      {item.state === "purchased" && (
        <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
          <Check className="size-4" strokeWidth={2} />
          {t("bought")}: {item.boughtQty} {item.unit}
        </div>
      )}
    </motion.div>
  )
}
