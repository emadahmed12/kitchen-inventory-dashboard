"use client"

import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { InventoryItem } from "@/types/inventory"

type DeleteItemDialogProps = {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteItemDialog({ item, open, onOpenChange, onConfirm }: DeleteItemDialogProps) {
  const t = useTranslations("deleteDialog")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: item?.name ?? "" })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button variant="destructive" className="rounded-xl" onClick={() => { onConfirm(); onOpenChange(false) }}>{t("confirm")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
