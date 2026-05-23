"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { toast } from "sonner"

import { DeleteItemDialog } from "@/components/inventory/delete-item-dialog"
import { InventoryStats } from "@/components/inventory/inventory-stats"
import { InventoryToolbar } from "@/components/inventory/inventory-toolbar"
import { InventoryView } from "@/components/inventory/inventory-view"
import { ItemFormDialog } from "@/components/inventory/item-form-dialog"
import { PageContainer } from "@/components/ui/page-container"
import { useShell } from "@/contexts/shell-context"
import { useInventory } from "@/hooks/use-inventory"
import type { InventoryItem, InventoryItemInput } from "@/types/inventory"

export function InventoryPage() {
  const {
    filteredItems,
    stats,
    hydrated,
    search,
    setSearch,
    category,
    setCategory,
    status,
    setStatus,
    sort,
    setSort,
    view,
    setViewMode,
    addItem,
    updateItem,
    deleteItem,
    updateQuantity,
    clearFilters,
    hasActiveFilters,
  } = useInventory()

  const { registerAddItem, searchQuery, setSearchQuery } = useShell()

  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null)

  const openAdd = useCallback(() => {
    setEditingItem(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    registerAddItem(openAdd)
    return () => registerAddItem(null)
  }, [registerAddItem, openAdd])

  useEffect(() => {
    if (searchQuery) {
      setSearch(searchQuery)
      setSearchQuery("")
    }
  }, [searchQuery, setSearch, setSearchQuery])

  function handleEdit(item: InventoryItem) {
    setEditingItem(item)
    setFormOpen(true)
  }

  function handleDelete(item: InventoryItem) {
    setDeletingItem(item)
  }

  function handleFormSubmit(data: InventoryItemInput) {
    if (editingItem) {
      updateItem(editingItem.id, data)
      toast.success("تم تحديث المنتج", { description: data.name })
    } else {
      addItem(data)
      toast.success("تمت الإضافة", { description: data.name })
    }
    setEditingItem(null)
  }

  function handleFormOpenChange(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingItem(null)
  }

  function handleQuantityChange(id: string, quantity: number) {
    updateQuantity(id, quantity)
  }

  function handleDeleteConfirm() {
    if (deletingItem) {
      deleteItem(deletingItem.id)
      toast.success("تم الحذف", { description: deletingItem.name })
      setDeletingItem(null)
    }
  }

  return (
    <PageContainer size="wide" className="flex flex-col gap-5 md:gap-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">
          المخزون
        </h1>
        <p className="text-sm text-muted-foreground">
          كل منتجات مطبخك — مرتّبة، قابلة للبحث، ومحدّثة فوراً.
        </p>
      </motion.div>

      <InventoryStats {...stats} />

      <InventoryToolbar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        status={status}
        onStatusChange={setStatus}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setViewMode}
        onAddClick={openAdd}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        resultCount={filteredItems.length}
      />

      <InventoryView
        items={filteredItems}
        view={view}
        hydrated={hydrated}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onQuantityChange={handleQuantityChange}
      />

      <ItemFormDialog
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        item={editingItem}
        onSubmit={handleFormSubmit}
      />

      <DeleteItemDialog
        item={deletingItem}
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  )
}
