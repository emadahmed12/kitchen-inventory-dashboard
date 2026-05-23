"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { CATEGORIES, STORAGE_LOCATIONS, UNIT_TYPES } from "@/data/catalog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { STATUS_COLORS } from "@/lib/inventory/constants"
import type { CategoryId, StorageLocationId, UnitTypeId } from "@/types/catalog"
import type { InventoryItem, InventoryItemInput, InventoryStatus } from "@/types/inventory"

type ItemFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: InventoryItem | null
  onSubmit: (data: InventoryItemInput) => void
}

const defaultForm: InventoryItemInput = {
  name: "", quantity: 1, unit: "bag", category: "grains", location: "pantry",
  status: "healthy", notes: "", tags: [], lowStockThreshold: 2,
}

export function ItemFormDialog({ open, onOpenChange, item, onSubmit }: ItemFormDialogProps) {
  const [form, setForm] = useState<InventoryItemInput>(defaultForm)
  const isEdit = Boolean(item)
  const t = useTranslations("form")
  const tStatus = useTranslations("status")
  const tCatalog = useTranslations("catalog")

  useEffect(() => {
    if (open) {
      setForm(item ? {
        name: item.name, quantity: item.quantity, unit: item.unit,
        category: item.category, location: item.location, status: item.status,
        lowStockThreshold: item.lowStockThreshold, notes: item.notes ?? "",
        tags: item.tags, metadata: item.metadata,
      } : defaultForm)
    }
  }, [open, item])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({ ...form, name: form.name.trim(), notes: form.notes?.trim() || undefined, tags: form.tags ?? [] })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-border/50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>{isEdit ? t("editDesc") : t("addDesc")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label={t("name")}>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("namePlaceholder")} className="rounded-xl" required />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("quantity")}>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 1 })} className="rounded-xl" />
            </Field>
            <Field label={t("threshold")}>
              <Input type="number" min={1} value={form.lowStockThreshold ?? 2} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) || 1 })} className="rounded-xl" />
            </Field>
          </div>

          <Field label={t("unit")}>
            <SelectNative value={form.unit} onChange={(v) => setForm({ ...form, unit: v as UnitTypeId })} options={UNIT_TYPES.map((u) => ({ value: u.id, label: tCatalog(`units.${u.id}`) }))} />
          </Field>

          <Field label={t("category")}>
            <SelectNative value={form.category} onChange={(v) => setForm({ ...form, category: v as CategoryId })} options={CATEGORIES.map((c) => ({ value: c.id, label: tCatalog(`categories.${c.id}`) }))} />
          </Field>

          <Field label={t("location")}>
            <SelectNative value={form.location} onChange={(v) => setForm({ ...form, location: v as StorageLocationId })} options={STORAGE_LOCATIONS.map((l) => ({ value: l.id, label: tCatalog(`locations.${l.id}`) }))} />
          </Field>

          <Field label={t("stockStatus")}>
            <SelectNative
              value={form.status ?? "healthy"}
              onChange={(v) => setForm({ ...form, status: v as InventoryStatus })}
              options={(Object.keys(STATUS_COLORS) as InventoryStatus[]).map((s) => ({ value: s, label: tStatus(s) }))}
            />
          </Field>

          <Field label={t("notes")}>
            <Input value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t("notesPlaceholder")} className="rounded-xl" />
          </Field>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            <Button type="submit" className="rounded-xl">{isEdit ? t("save") : t("add")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium text-foreground/90">{label}</span>
      {children}
    </label>
  )
}

function SelectNative({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30">
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
