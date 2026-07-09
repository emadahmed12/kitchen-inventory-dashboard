"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { CheckSquare, Package, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { InventoryItem } from "@/types/inventory"
import type { UserStorageLocation } from "@/types/storage"

type MoveItemsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The location items are being moved FROM. */
  sourceLocation: UserStorageLocation | null
  /** All items currently in the source location. */
  items: InventoryItem[]
  /** All available locations (source is filtered out for the target picker). */
  locations: UserStorageLocation[]
  onConfirm: (itemIds: string[], targetLocationId: string) => Promise<boolean>
}

export function MoveItemsDialog({
  open,
  onOpenChange,
  sourceLocation,
  items,
  locations,
  onConfirm,
}: MoveItemsDialogProps) {
  const t = useTranslations("storage")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [targetId, setTargetId] = useState("")
  const [isMoving, setIsMoving] = useState(false)

  const targets = useMemo(
    () => locations.filter((l) => l.id !== sourceLocation?.id),
    [locations, sourceLocation]
  )

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      // Pre-select everything — bulk move is the common case
      setSelected(new Set(items.map((i) => i.id)))
      setTargetId(targets[0]?.id ?? "")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = selected.size === items.length && items.length > 0

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(items.map((i) => i.id)))
  }

  async function handleConfirm() {
    if (selected.size === 0 || !targetId) return
    setIsMoving(true)
    const ok = await onConfirm([...selected], targetId)
    setIsMoving(false)
    if (ok) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-border/50 max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("moveItemsTitle", { name: sourceLocation?.name ?? "" })}
          </DialogTitle>
          <DialogDescription>{t("moveItemsDesc")}</DialogDescription>
        </DialogHeader>

        {/* Item selection */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-2 self-start text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {allSelected ? (
              <CheckSquare className="size-3.5" strokeWidth={1.75} />
            ) : (
              <Square className="size-3.5" strokeWidth={1.75} />
            )}
            {t("moveSelectAll")}
          </button>

          <ul className="flex flex-col gap-1.5">
            {items.map((item) => {
              const isSelected = selected.has(item.id)
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-start text-sm transition-colors",
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/40 bg-muted/20 opacity-60"
                    )}
                  >
                    {isSelected ? (
                      <CheckSquare className="size-4 shrink-0 text-primary" strokeWidth={1.75} />
                    ) : (
                      <Square className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                    )}
                    <Package className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                    <span className="truncate font-medium">{item.name}</span>
                    <span className="ms-auto shrink-0 text-xs tabular-nums text-muted-foreground">
                      {item.quantity} {item.unit}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Target picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            {t("moveTarget")}
          </label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {targets.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <DialogFooter className="gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMoving}
            className="rounded-xl"
          >
            {t("deleteCancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isMoving || selected.size === 0 || !targetId}
            className="rounded-xl"
          >
            {isMoving ? "…" : t("moveConfirm", { count: selected.size })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
