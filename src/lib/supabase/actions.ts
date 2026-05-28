"use server"

import { createServerClient } from "./server"
import { dbItemToLocal, localInputToDb, localItemToDbUpdate } from "./sync"
import { inventoryItemSchema, quantityUpdateSchema } from "@/lib/validation/inventory"
import type { InventoryItem, InventoryItemInput } from "@/types/inventory"

// ── helpers ──────────────────────────────────────────────────────────────────

async function getAuthenticatedClient() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return { supabase, user }
}

/**
 * Validate input with Zod and throw a structured error if invalid.
 * This runs server-side so client-side bypass is not possible.
 */
function validateInput<T>(schema: { parse: (data: unknown) => T }, data: unknown): T {
  return schema.parse(data) // throws ZodError → becomes a serialized error
}

// ── inventory CRUD ────────────────────────────────────────────────────────────

/** Fetch all items for the current user (used on initial load). */
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  const { supabase } = await getAuthenticatedClient()
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("updated_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbItemToLocal)
}

/** Insert a new item and return the DB-assigned row. */
export async function serverAddItem(input: InventoryItemInput): Promise<InventoryItem> {
  const { supabase, user } = await getAuthenticatedClient()
  const validated = validateInput(inventoryItemSchema, input)

  const { data, error } = await supabase
    .from("inventory_items")
    .insert(localInputToDb(validated as InventoryItemInput, user.id))
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Log activity
  await supabase.from("activity_logs").insert({
    user_id: user.id,
    item_id: data.id,
    item_name: data.name,
    action: "created",
    changes: { name: data.name, quantity: data.quantity },
  })

  return dbItemToLocal(data)
}

/** Update an existing item and return the updated row. */
export async function serverUpdateItem(
  id: string,
  input: InventoryItemInput
): Promise<InventoryItem> {
  const { supabase, user } = await getAuthenticatedClient()
  const validated = validateInput(inventoryItemSchema, input)

  const { data, error } = await supabase
    .from("inventory_items")
    .update(localItemToDbUpdate(validated as InventoryItemInput))
    .eq("id", id)
    .eq("user_id", user.id) // RLS guard at app level too
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    item_id: id,
    item_name: data.name,
    action: "updated",
    changes: localItemToDbUpdate(input),
  })

  return dbItemToLocal(data)
}

/** Update only the quantity field (optimised for the quantity stepper). */
export async function serverUpdateQuantity(
  id: string,
  quantity: number,
  previousQuantity: number
): Promise<InventoryItem> {
  const { supabase, user } = await getAuthenticatedClient()
  const { quantity: validQuantity } = validateInput(quantityUpdateSchema, { quantity })

  const { data, error } = await supabase
    .from("inventory_items")
    .update({ quantity: validQuantity, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    item_id: id,
    item_name: data.name,
    action: quantity > previousQuantity ? "quantity_increased" : "quantity_decreased",
    changes: { from: previousQuantity, to: quantity },
  })

  return dbItemToLocal(data)
}

/** Permanently delete an item. */
export async function serverDeleteItem(id: string, itemName: string): Promise<void> {
  const { supabase, user } = await getAuthenticatedClient()

  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) throw new Error(error.message)

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    item_id: null,
    item_name: itemName,
    action: "deleted",
    changes: {},
  })
}

/** Seed the DB with a batch of items (used when a new user has local data). */
export async function serverSeedItems(items: InventoryItemInput[]): Promise<InventoryItem[]> {
  const { supabase, user } = await getAuthenticatedClient()

  const rows = items.map((i) => localInputToDb(i, user.id))
  const { data, error } = await supabase
    .from("inventory_items")
    .insert(rows)
    .select()

  if (error) throw new Error(error.message)
  return (data ?? []).map(dbItemToLocal)
}
