"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { InventoryItem } from "@/types/inventory"

type DeleteItemDialogProps = {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteItemDialog({
  item,
  open,
  onOpenChange,
  onConfirm,
}: DeleteItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle>حذف المنتج</DialogTitle>
          <DialogDescription>
            هل أنت متأكد من حذف{" "}
            <span className="font-medium text-foreground">
              {item?.name}
            </span>
            ؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            className="rounded-xl"
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
