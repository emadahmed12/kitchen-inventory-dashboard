"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { ArrowDownAZ, ChevronDown, Grid3X3, List, Plus, Search, SlidersHorizontal, X } from "lucide-react"

import { CATEGORIES } from "@/data/catalog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import type { CategoryId } from "@/types/catalog"
import type { InventoryStatus } from "@/types/inventory"
import type { SortOption, StatusFilter, ViewMode } from "@/types/ui"
import { cn } from "@/lib/utils"

type InventoryToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  category: CategoryId | "all"
  onCategoryChange: (value: CategoryId | "all") => void
  status: StatusFilter
  onStatusChange: (value: StatusFilter) => void
  sort: SortOption
  onSortChange: (value: SortOption) => void
  view: ViewMode
  onViewChange: (value: ViewMode) => void
  onAddClick: () => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  resultCount: number
}

const STATUS_KEYS: StatusFilter[] = ["all", "healthy", "opened", "low", "almost_finished", "needsAttention"]
const SORT_KEYS: SortOption[] = ["name-asc", "name-desc", "quantity-desc", "quantity-asc", "status", "updated-desc"]

export function InventoryToolbar({
  search, onSearchChange, category, onCategoryChange, status, onStatusChange,
  sort, onSortChange, view, onViewChange, onAddClick, onClearFilters,
  hasActiveFilters, resultCount,
}: InventoryToolbarProps) {
  const t = useTranslations("inventory")
  const tStatus = useTranslations("status")
  const tSort = useTranslations("sort")
  const tCatalog = useTranslations("catalog.categories")

  const categories: Array<{ value: CategoryId | "all"; label: string }> = [
    { value: "all", label: t("all") },
    ...CATEGORIES.map((c) => ({ value: c.id, label: tCatalog(c.id) })),
  ]

  const statusLabel = (s: StatusFilter) =>
    s === "all" ? t("all") : s === "needsAttention" ? t("needsAttention") : tStatus(s as InventoryStatus)
  const sortLabel = (s: SortOption) => tSort(s)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 rounded-2xl border-transparent bg-muted/40 ps-10 text-sm shadow-none transition-all duration-200 focus-visible:border-border/60 focus-visible:bg-background/80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-muted/50 p-0.5 ring-1 ring-foreground/[0.06]">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon-sm" className="rounded-lg" onClick={() => onViewChange("grid")} aria-label={t("gridView")}>
              <Grid3X3 className="size-4" strokeWidth={1.75} />
            </Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon-sm" className="rounded-lg" onClick={() => onViewChange("list")} aria-label={t("listView")}>
              <List className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
          <Button className="hidden rounded-xl gap-1.5 sm:inline-flex" onClick={onAddClick}>
            <Plus className="size-4" strokeWidth={2} />
            {t("addItem")}
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
              className={cn("shrink-0 rounded-full px-3.5", category === cat.value && "shadow-sm ring-1 ring-foreground/8")}
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
                {statusLabel(status)}
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {STATUS_KEYS.map((s) => (
                <DropdownMenuItem key={s} onClick={() => onStatusChange(s)}>{statusLabel(s)}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
                <ArrowDownAZ className="size-3.5" />
                {sortLabel(sort)}
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {SORT_KEYS.map((s) => (
                <DropdownMenuItem key={s} onClick={() => onSortChange(s)}>{sortLabel(s)}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-muted-foreground" onClick={onClearFilters}>
              <X className="size-3.5" />
              {t("clearFilters")}
            </Button>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {hasActiveFilters ? t("resultsFiltered", { count: resultCount }) : t("results", { count: resultCount })}
      </p>
    </motion.div>
  )
}
