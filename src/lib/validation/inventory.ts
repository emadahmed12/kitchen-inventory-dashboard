import { z } from "zod"

const CATEGORY_IDS = ["canned", "grains", "pasta", "bread", "beverages", "spices", "oils"] as const
// Note: location is now a free-form string — users can create custom locations.
// Validation only checks that the field is non-empty.
// Server-side reference integrity is enforced by the storage_locations RLS policies.
const UNIT_IDS = ["kg", "can", "bag", "bottle"] as const
const STATUS_VALUES = ["healthy", "opened", "low", "almost_finished"] as const

/** Validates and sanitises a complete inventory item input (create + update). */
export const inventoryItemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or fewer")
    .trim(),
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int("Quantity must be a whole number")
    .min(0, "Quantity cannot be negative")
    .max(9_999, "Quantity must be 9,999 or less"),
  unit: z.enum(UNIT_IDS, { error: "Invalid unit" }),
  category: z.enum(CATEGORY_IDS, { error: "Invalid category" }),
  location: z.string().min(1, "Storage location is required"),
  status: z.enum(STATUS_VALUES).optional(),
  lowStockThreshold: z
    .number({ error: "Threshold must be a number" })
    .int("Threshold must be a whole number")
    .min(0, "Threshold cannot be negative")
    .max(9_999, "Threshold must be 9,999 or less")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be 500 characters or fewer")
    .optional()
    .transform((v) => v?.trim() || undefined),
  tags: z.array(z.string().max(30)).max(10).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  // Image URL must be a valid HTTPS URL from Supabase Storage or empty
  imageUrl: z
    .string()
    .url()
    .optional()
    .transform((v) => v || undefined),
})

export type InventoryItemSchemaInput = z.input<typeof inventoryItemSchema>
export type InventoryItemSchemaOutput = z.output<typeof inventoryItemSchema>

/** Lightweight schema for quantity-only updates (used by stepper). */
export const quantityUpdateSchema = z.object({
  quantity: z
    .number({ error: "Quantity must be a number" })
    .int()
    .min(0)
    .max(9_999),
})
