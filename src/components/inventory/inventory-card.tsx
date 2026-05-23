"use client"

import { motion } from "framer-motion"
import {
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"

import { QuantityStepper } from "@/components/inventory/quantity-stepper"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/inventory/constants"
import {
  getCategoryLabel,
  getLocationLabel,
} from "@/lib/inventory/catalog-helpers"
import { formatQuantity } from "@/lib/inventory/format"
import { getCategoryIcon } from "@/lib/inventory/icons"
import type { InventoryItem } from "@/types/inventory"
import { cn } from "@/lib/utils"

type InventoryCardProps = {
  item: InventoryItem
  index: number
  onEdit: (item: InventoryItem) => void
  onDelete: (item: InventoryItem) => void
  onQuantityChange: (id: string, quantity: number) => void
}

export function InventoryCard({
  item,
  index,
  onEdit,
  onDelete,
  onQuantityChange,
}: InventoryCardProps) {
  const colors = STATUS_COLORS[item.status]
  const Icon = getCategoryIcon(item.category)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
      transition={{
        delay: Math.min(index * 0.025, 0.2),
        duration: 0.38,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className={cn(
        "glass-card status-glow group relative flex min-h-[13.5rem] flex-col overflow-hidden rounded-3xl p-5",
        "transition-shadow duration-300 hover:shadow-xl",
        colors.glow,
        `status-glow-${item.status}`
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-12 -start-12 size-32 rounded-full opacity-30 blur-2xl",
          colors.dot
        )}
        aria-hidden
      />

      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-muted/80 to-muted/30 ring-1 ring-foreground/[0.08]"
          >
            <Icon className="size-5 text-foreground/70" strokeWidth={1.5} />
          </motion.div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-base font-semibold leading-snug tracking-tight">
              {item.name}
            </h3>
            {item.notes && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {item.notes}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 rounded-xl opacity-70 transition-opacity hover:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="size-4" />
              تعديل المنتج
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuantityChange(item.id, item.quantity + 1)}>
              <span className="text-xs">+١ سريع</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="size-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative mb-4 flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={cn("rounded-full text-xs ring-1", colors.badge)}
        >
          <span
            className={cn("me-1.5 inline-block size-1.5 rounded-full", colors.dot)}
          />
          {STATUS_LABELS[item.status]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatQuantity(item)}
        </span>
      </div>

      <div className="relative mt-auto space-y-3 border-t border-border/40 pt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            الكمية
          </span>
          <QuantityStepper
            value={item.quantity}
            onChange={(q) => onQuantityChange(item.id, q)}
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate">{getLocationLabel(item.location)}</span>
        </div>
        <p className="text-[0.7rem] font-medium text-muted-foreground/90">
          {getCategoryLabel(item.category)}
        </p>
      </div>
    </motion.article>
  )
}
