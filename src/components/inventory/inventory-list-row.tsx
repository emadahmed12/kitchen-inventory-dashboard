"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { MapPin, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { QuantityStepper } from "@/components/inventory/quantity-stepper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { STATUS_COLORS } from "@/lib/inventory/constants"
import { getCategoryIcon } from "@/lib/inventory/icons"
import type { InventoryItem } from "@/types/inventory"
import { cn } from "@/lib/utils"

type InventoryListRowProps = {
  item: InventoryItem
  index: number
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  onQuantityChange: (id: string, quantity: number) => void
}

export function InventoryListRow({ item, index, onEdit, onDelete, onQuantityChange }: InventoryListRowProps) {
  const colors = STATUS_COLORS[item.status]
  const Icon = getCategoryIcon(item.category)
  const t = useTranslations("inventory")
  const tStatus = useTranslations("status")
  const tCatalog = useTranslations("catalog")

  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8, transition: { duration: 0.18 } }}
      transition={{ delay: Math.min(index * 0.02, 0.16), duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ x: -3 }}
      className={cn("glass-card status-glow group flex flex-col gap-3 rounded-2xl px-4 py-3.5 sm:flex-row sm:items-center transition-shadow duration-300 hover:shadow-md", colors.glow, `status-glow-${item.status}`)}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-foreground/[0.06]">
          <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold">{item.name}</h3>
            <Badge variant="outline" className={cn("rounded-full text-[0.65rem] ring-1", colors.badge)}>
              {tStatus(item.status)}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3" strokeWidth={1.75} />
              {tCatalog(`locations.${item.location}`)}
            </span>
            <span>{tCatalog(`categories.${item.category}`)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:justify-end">
        <QuantityStepper value={item.quantity} onChange={(q) => onQuantityChange(item.id, q)} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-xl">
              <MoreHorizontal className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="size-4" />
              {t("edit")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
              <Trash2 className="size-4" />
              {t("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.article>
  )
}
