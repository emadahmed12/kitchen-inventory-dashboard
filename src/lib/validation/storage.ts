import { z } from "zod"

const STORAGE_TYPES = [
  "fridge",
  "freezer",
  "pantry",
  "cabinet",
  "counter",
  "other",
] as const

export const storageLocationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be 60 characters or fewer")
    .trim(),
  type: z.enum(STORAGE_TYPES, { error: "Invalid storage type" }),
  capacity: z
    .number({ error: "Capacity must be a number" })
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(500, "Capacity must be 500 or less"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex colour")
    .optional()
    .or(z.literal("")),
  icon: z.string().max(30).optional(),
})

export type StorageLocationSchemaOutput = z.output<typeof storageLocationSchema>
