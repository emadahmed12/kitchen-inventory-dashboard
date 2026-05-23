"use client"

import { motion } from "framer-motion"
import {
  ArrowDownAZ,
  ChevronDown,
  Grid3X3,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"

import { CATEGORIES } from "@/data/catalog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { SORT_LABELS, STATUS_LABELS } from "@/lib/inventory/constants"
import type { CategoryId } from "@/types/catalog"
import type { InventoryStatus } from "@/types/inventory"
import type { SortOption, ViewMode } from "@/types/ui"
import { cn } from "@/lib/utils"

type InventoryToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  category: CategoryId | "all"
  onCategoryChange: (value: CategoryId | "all") => void
  status: InventoryStatus | "all"
  onStatusChange: (value: InventoryStatus | "all") => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
  view: ViewMode
  onViewChange: (value: ViewMode) => void
  onAddClick: () => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  resultCount: number
}

const categories: Array<{ value: CategoryId | "all"; label: string }> = [
  { value: "all", label: "الكل" },
  ...CATEGORIES.map((c) => ({ value: c.id, label: c.label })),
]

const statuses: Array<{ value: InventoryStatus | "all"; label: string }> = [
  { value: "all", label: "الكل" },
  ...Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value: value as InventoryStatus,
    label,
  })),
]

const sortOptions = Object.entries(SORT_LABELS) as [SortOption, string][]

export function InventoryToolbar({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  view,
  onViewChange,
  onAddClick,
  onClearFilters,
  hasActiveFilters,
  resultCount,
}: InventoryToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
          />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث في المنتجات..."
            className="h-10 rounded-2xl border-transparent bg-muted/40 ps-10 text-sm shadow-none transition-all duration-200 focus-visible:border-border/60 focus-visible:bg-background/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-muted/50 p-0.5 ring-1 ring-foreground/[0.06]">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-lg"
              onClick={() => onViewChange("grid")}
              aria-label="عرض شبكي"
            >
              <Grid3X3 className="size-4" strokeWidth={1.75} />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-lg"
              onClick={() => onViewChange("list")}
              aria-label="عرض قائمة"
            >
              <List className="size-4" strokeWidth={1.75} />
            </Button>
          </div>

          <Button
            className="hidden rounded-xl gap-1.5 sm:inline-flex"
            onClick={onAddClick}
          >
            <Plus className="size-4" strokeWidth={2} />
            إضافة منتج
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "shrink-0 rounded-full px-3.5",
                category === cat.value && "shadow-sm ring-1 ring-foreground/8"
              )}
              onClick={() => onCategoryChange(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                <SlidersHorizontal className="size-3.5" />
                {statuses.find((s) => s.value === status)?.label}
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {statuses.map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  onClick={() => onStatusChange(s.value)}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                <ArrowDownAZ className="size-3.5" />
                {SORT_LABELS[sort]}
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {sortOptions.map(([value, label]) => (
                <DropdownMenuItem key={value} onClick={() => onSortChange(value)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl gap-1 text-muted-foreground"
              onClick={onClearFilters}
            >
              <X className="size-3.5" />
              مسح
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {resultCount.toLocaleString("ar-EG")} منتج
        {hasActiveFilters ? " مطابق للفلاتر" : ""}
      </p>
    </motion.div>
  )
}
