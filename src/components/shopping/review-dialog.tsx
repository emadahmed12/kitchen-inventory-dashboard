"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, SkipForward } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { InventoryUpdate, ShoppingSession } from "@/types/shopping"

type ReviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: ShoppingSession
  updates: InventoryUpdate[]
  onConfirm: () => void
}

export function ReviewDialog({
  open,
  onOpenChange,
  session,
  updates,
  onConfirm,
}: ReviewDialogProps) {
  const t = useTranslations("shopping.review")

  const skipped = session.items.filter((i) => i.state === "skipped")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-border/50 max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>

        {updates.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("noUpdates")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t("itemsBought")}
            </p>
            <ul className="flex flex-col gap-2">
              {updates.map((u) => (
                <motion.li
                  key={u.inventoryItemId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-2xl bg-muted/30 px-4 py-3"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" strokeWidth={2} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{u.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <span>{t("currentStock")}: {u.currentStock} {u.unit}</span>
                      <span>·</span>
                      <span className="text-primary">+{u.addedQty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums">{u.currentStock}</span>
                    <ArrowRight className="size-3 text-muted-foreground/50" />
                    <span className="text-sm font-semibold tabular-nums text-emerald-500">{u.newStock}</span>
                    <span className="text-xs text-muted-foreground"> {u.unit}</span>
                  </div>
                </motion.li>
              ))}
            </ul>

            {skipped.length > 0 && (
              <>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                  {t("itemsSkipped")}
                </p>
                <ul className="flex flex-col gap-1.5">
                  {skipped.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 rounded-xl bg-muted/20 px-3 py-2 text-xs text-muted-foreground"
                    >
                      <SkipForward className="size-3.5 shrink-0" strokeWidth={1.75} />
                      {item.name}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            {t("cancel")}
          </Button>
          <Button onClick={onConfirm} className="rounded-xl gap-2">
            <CheckCircle2 className="size-4" strokeWidth={2} />
            {t("apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
