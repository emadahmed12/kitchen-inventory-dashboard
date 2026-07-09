"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { StorageLocationInput, StorageType, UserStorageLocation } from "@/types/storage"

const STORAGE_TYPES: StorageType[] = [
  "fridge",
  "freezer",
  "pantry",
  "cabinet",
  "counter",
  "other",
]

const DEFAULT_FORM: StorageLocationInput = {
  name: "",
  type: "other",
  capacity: 10,
  color: "",
  icon: "",
  notes: "",
}

type StorageFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  location?: UserStorageLocation | null
  onSubmit: (data: StorageLocationInput) => void
  isSaving?: boolean
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function SelectNative({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function StorageFormDialog({
  open,
  onOpenChange,
  location,
  onSubmit,
  isSaving = false,
}: StorageFormDialogProps) {
  const t = useTranslations("storage")
  const isEdit = Boolean(location)
  const [form, setForm] = useState<StorageLocationInput>(DEFAULT_FORM)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setForm(
        location
          ? {
              name: location.name,
              type: location.type,
              capacity: location.capacity,
              color: location.color ?? "",
              icon: location.icon ?? "",
              notes: location.notes ?? "",
            }
          : DEFAULT_FORM
      )
    }
  }, [open, location])
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({
      ...form,
      name: form.name.trim(),
      color: form.color?.trim() || undefined,
      icon: form.icon?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    })
    onOpenChange(false)
  }

  const typeOptions = STORAGE_TYPES.map((tp) => ({
    value: tp,
    label: t(`types.${tp}` as `types.${StorageType}`),
  }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl border-border/50">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("form.editTitle") : t("form.addTitle")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEdit ? t("editLocation") : t("addLocation")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label={t("form.name")}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={t("form.namePlaceholder")}
              className="rounded-xl"
              required
              disabled={isSaving}
            />
          </Field>

          <Field label={t("form.type")}>
            <SelectNative
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v as StorageType })}
              options={typeOptions}
            />
          </Field>

          <Field label={t("form.capacity")}>
            <Input
              type="number"
              min={1}
              max={500}
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: Math.max(1, Number(e.target.value) || 1) })
              }
              className="rounded-xl"
              disabled={isSaving}
            />
          </Field>

          <Field label={t("form.color")}>
            <div className="flex items-center gap-2">
              <Input
                value={form.color ?? ""}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder={t("form.colorPlaceholder")}
                className="rounded-xl font-mono text-xs"
                maxLength={7}
                disabled={isSaving}
              />
              {form.color && /^#[0-9a-fA-F]{6}$/.test(form.color) && (
                <div
                  className="size-9 shrink-0 rounded-xl border border-border/40"
                  style={{ background: form.color }}
                />
              )}
            </div>
          </Field>

          <Field label={t("form.notes")}>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={t("form.notesPlaceholder")}
              maxLength={300}
              rows={2}
              disabled={isSaving}
              className="flex w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </Field>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="rounded-xl"
            >
              {t("form.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !form.name.trim()}
              className="rounded-xl"
            >
              {isSaving
                ? "…"
                : isEdit
                  ? t("form.save")
                  : t("form.add")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
