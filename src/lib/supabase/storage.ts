"use client"

import { createClient } from "./client"
import { SUPABASE_ENABLED } from "./config"

const BUCKET = "item-images"

/**
 * Upload an image for an inventory item.
 *
 * @param userId  Supabase user ID (used as folder name for RLS)
 * @param itemId  Inventory item ID
 * @param file    The image file to upload
 * @returns Public URL of the uploaded image
 */
export async function uploadItemImage(
  userId: string,
  itemId: string,
  file: File
): Promise<string> {
  if (!SUPABASE_ENABLED) throw new Error("Supabase is not configured")

  const supabase = createClient()
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `${userId}/${itemId}.${ext}`

  // Remove existing image if any
  await supabase.storage.from(BUCKET).remove([path])

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type,
  })

  if (error) throw new Error(error.message)

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return publicUrl
}

/**
 * Delete the image for an inventory item.
 */
export async function deleteItemImage(userId: string, itemId: string): Promise<void> {
  if (!SUPABASE_ENABLED) return

  const supabase = createClient()
  const extensions = ["jpg", "jpeg", "png", "webp", "gif"]
  const paths = extensions.map((ext) => `${userId}/${itemId}.${ext}`)

  // Try to remove all possible extensions (we don't store the ext separately)
  await supabase.storage.from(BUCKET).remove(paths)
}
