"use server"

import { createServerClient } from "./server"
import type { UserStorageLocation, StorageLocationInput, StorageType } from "@/types/storage"
import type { DbStorageLocation } from "./types"
import { storageLocationSchema } from "@/lib/validation/storage"

// ── type mapping ──────────────────────────────────────────────────────────────

function dbToLocal(row: DbStorageLocation): UserStorageLocation {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type as StorageType,
    capacity: row.capacity,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function getClient() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return { supabase, user }
}

// ── actions ───────────────────────────────────────────────────────────────────

/** Fetch all storage locations for the current user. */
export async function fetchStorageLocations(): Promise<UserStorageLocation[]> {
  const { supabase } = await getClient()
  const { data, error } = await supabase
    .from("storage_locations")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToLocal)
}

/**
 * Seed default storage locations for a brand-new user.
 * Uses the static slug IDs ('kitchen', 'fridge', etc.) so existing seed
 * inventory data continues to reference valid locations.
 */
export async function seedDefaultStorageLocations(
  translations: { kitchen: string; fridge: string; freezer: string; pantry: string }
): Promise<UserStorageLocation[]> {
  const { supabase, user } = await getClient()

  const defaults = [
    { id: "kitchen",  name: translations.kitchen,  type: "other",   capacity: 12, is_default: true },
    { id: "fridge",   name: translations.fridge,   type: "fridge",  capacity: 10, is_default: true },
    { id: "freezer",  name: translations.freezer,  type: "freezer", capacity: 8,  is_default: true },
    { id: "pantry",   name: translations.pantry,   type: "pantry",  capacity: 20, is_default: true },
  ] as const

  // upsert so calling this multiple times is idempotent
  const { data, error } = await supabase
    .from("storage_locations")
    .upsert(
      defaults.map((d) => ({ ...d, user_id: user.id })),
      { onConflict: "id,user_id", ignoreDuplicates: true }
    )
    .select()

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbToLocal)
}

/** Create a new storage location. */
export async function createStorageLocation(
  input: StorageLocationInput
): Promise<UserStorageLocation> {
  const { supabase, user } = await getClient()
  const validated = storageLocationSchema.parse(input)

  // Generate a random ID (not one of the reserved static slugs)
  const id = crypto.randomUUID()

  const { data, error } = await supabase
    .from("storage_locations")
    .insert({
      id,
      user_id: user.id,
      name: validated.name,
      type: validated.type,
      capacity: validated.capacity,
      color: validated.color ?? null,
      icon: validated.icon ?? null,
      is_default: false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbToLocal(data)
}

/** Update an existing storage location. */
export async function updateStorageLocation(
  id: string,
  input: StorageLocationInput
): Promise<UserStorageLocation> {
  const { supabase, user } = await getClient()
  const validated = storageLocationSchema.parse(input)

  const { data, error } = await supabase
    .from("storage_locations")
    .update({
      name: validated.name,
      type: validated.type,
      capacity: validated.capacity,
      color: validated.color ?? null,
      icon: validated.icon ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return dbToLocal(data)
}

/** Delete a storage location (only if it has no items assigned). */
export async function deleteStorageLocation(id: string): Promise<void> {
  const { supabase, user } = await getClient()

  // Guard: check item count first
  const { count, error: countError } = await supabase
    .from("inventory_items")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("location", id)

  if (countError) throw new Error(countError.message)
  if (count && count > 0) {
    throw new Error(`LOCATION_HAS_ITEMS:${count}`)
  }

  const { error } = await supabase
    .from("storage_locations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)
}
