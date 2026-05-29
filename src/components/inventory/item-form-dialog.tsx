"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { ImagePlus, X } from "lucide-react"

import { CATEGORIES, UNIT_TYPES } from "@/data/catalog"
import { useStorageLocations } from "@/hooks/use-storage"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { STATUS_COLORS } from "@/lib/inventory/constants"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import { uploadItemImage } from "@/lib/supabase/storage"
import { useAuth } from "@/hooks/use-auth"
import type { CategoryId, UnitTypeId } from "@/types/catalog"
import type { InventoryItem, InventoryItemInput, InventoryStatus } from "@/types/inventory"

type ItemFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: InventoryItem | null
  onSubmit: (data: InventoryItemInput) => void
}

const defaultForm: InventoryItemInput = {
  name: "",
  quantity: 1,
  unit: "bag",
  category: "grains",
  location: "pantry",
  status: "healthy",
  notes: "",
  tags: [],
  lowStockThreshold: 2,
}

export function ItemFormDialog({ open, onOpenChange, item, onSubmit }: ItemFormDialogProps) {
  const [form, setForm] = useState<InventoryItemInput>(defaultForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEdit = Boolean(item)
  const { user } = useAuth()
  const t = useTranslations("form")
  const tStatus = useTranslations("status")
  const tCatalog = useTranslations("catalog")
  const storageLocations = useStorageLocations()

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setForm(
        item
          ? {
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              location: item.location,
              status: item.status,
              lowStockThreshold: item.lowStockThreshold,
              notes: item.notes ?? "",
              tags: item.tags,
              metadata: item.metadata,
              imageUrl: item.imageUrl,
            }
          : defaultForm
      )
      setImageFile(null)
      setImagePreview(item?.imageUrl ?? null)
    }
  }, [open, item])
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const url = URL.createObjectURL(file)
    setImagePreview(url)
  }

  function clearImage() {
    setImageFile(null)
    setImagePreview(null)
    setForm((f) => ({ ...f, imageUrl: undefined }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return

    let imageUrl = form.imageUrl

    // Upload image if a new file was selected
    if (imageFile && SUPABASE_ENABLED && user) {
      setUploading(true)
      try {
        const tempId = item?.id ?? `temp-${Date.now()}`
        imageUrl = await uploadItemImage(user.id, tempId, imageFile)
      } catch {
        // Image upload failed — continue without image
      } finally {
        setUploading(false)
      }
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      notes: form.notes?.trim() || undefined,
      tags: form.tags ?? [],
      imageUrl,
    })
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
          {/* Image upload (only when Supabase is available) */}
          {SUPABASE_ENABLED && (
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <div className="relative size-16 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt=""
                    className="size-16 rounded-2xl object-cover ring-1 ring-border/50"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-1.5 -end-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-white ring-2 ring-background"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border/60 bg-muted/30 text-muted-foreground transition hover:border-border hover:bg-muted/50"
                >
                  <ImagePlus className="size-5" strokeWidth={1.5} />
                </button>
              )}
              <div className="flex-1">
                <p className="text-xs font-medium">{t("image")}</p>
                <p className="text-xs text-muted-foreground">{t("imageDrop")}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </div>
            </div>
          )}

          <Field label={t("name")}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("namePlaceholder")}
              className="rounded-xl"
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("quantity")}>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: Number(e.target.value) || 1 })
                }
                className="rounded-xl"
              />
            </Field>
            <Field label={t("threshold")}>
              <Input
                type="number"
                min={1}
                value={form.lowStockThreshold ?? 2}
                onChange={(e) =>
                  setForm({ ...form, lowStockThreshold: Number(e.target.value) || 1 })
                }
                className="rounded-xl"
              />
            </Field>
          </div>

          <Field label={t("unit")}>
            <SelectNative
              value={form.unit}
              onChange={(v) => setForm({ ...form, unit: v as UnitTypeId })}
              options={UNIT_TYPES.map((u) => ({ value: u.id, label: tCatalog(`units.${u.id}`) }))}
            />
          </Field>

          <Field label={t("category")}>
            <SelectNative
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v as CategoryId })}
              options={CATEGORIES.map((c) => ({
                value: c.id,
                label: tCatalog(`categories.${c.id}`),
              }))}
            />
          </Field>

          <Field label={t("location")}>
            <SelectNative
              value={form.location}
              onChange={(v) => setForm({ ...form, location: v })}
              options={storageLocations.map((l) => ({
                value: l.id,
                label: l.name,
              }))}
            />
          </Field>

          <Field label={t("stockStatus")}>
            <SelectNative
              value={form.status ?? "healthy"}
              onChange={(v) => setForm({ ...form, status: v as InventoryStatus })}
              options={(Object.keys(STATUS_COLORS) as InventoryStatus[]).map((s) => ({
                value: s,
                label: tStatus(s),
              }))}
            />
          </Field>

          <Field label={t("notes")}>
            <Input
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("notesPlaceholder")}
              className="rounded-xl"
            />
          </Field>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" className="rounded-xl" disabled={uploading}>
              {uploading ? t("uploading") : isEdit ? t("save") : t("add")}
            </Button>
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

function SelectNative({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
