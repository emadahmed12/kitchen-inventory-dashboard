"use client"

import { useEffect, useRef } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { SUPABASE_ENABLED } from "./config"
import { createClient } from "./client"
import { dbItemToLocal } from "./sync"
import type { DbInventoryItem, DbStorageLocation } from "./types"
import type { UserStorageLocation, StorageType } from "@/types/storage"

type RealtimeCallbacks = {
  onInsert: (item: ReturnType<typeof dbItemToLocal>) => void
  onUpdate: (item: ReturnType<typeof dbItemToLocal>) => void
  onDelete: (id: string) => void
}

/**
 * Subscribes to Postgres changes on `inventory_items` for the current user.
 * Calls the provided callbacks whenever an INSERT / UPDATE / DELETE arrives
 * from another tab or device.
 *
 * No-op when SUPABASE_ENABLED is false.
 */
export function useRealtimeInventory(
  userId: string | null,
  callbacks: RealtimeCallbacks
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!SUPABASE_ENABLED || !userId) return

    const supabase = createClient()

    channelRef.current = supabase
      .channel(`inventory:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inventory_items",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callbacks.onInsert(dbItemToLocal(payload.new as DbInventoryItem))
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "inventory_items",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callbacks.onUpdate(dbItemToLocal(payload.new as DbInventoryItem))
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "inventory_items",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callbacks.onDelete((payload.old as { id: string }).id)
        }
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])
}

function dbStorageToLocal(row: DbStorageLocation): UserStorageLocation {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    type: row.type as StorageType,
    capacity: row.capacity,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    notes: row.notes ?? undefined,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

type StorageRealtimeCallbacks = {
  onInsert: (location: UserStorageLocation) => void
  onUpdate: (location: UserStorageLocation) => void
  onDelete: (id: string) => void
}

/**
 * Subscribes to Postgres changes on `storage_locations` for the current user.
 * Keeps the storage store in sync across tabs and devices.
 * No-op when SUPABASE_ENABLED is false.
 */
export function useRealtimeStorage(
  userId: string | null,
  callbacks: StorageRealtimeCallbacks
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!SUPABASE_ENABLED || !userId) return

    const supabase = createClient()

    channelRef.current = supabase
      .channel(`storage:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "storage_locations", filter: `user_id=eq.${userId}` },
        (payload) => callbacks.onInsert(dbStorageToLocal(payload.new as DbStorageLocation))
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "storage_locations", filter: `user_id=eq.${userId}` },
        (payload) => callbacks.onUpdate(dbStorageToLocal(payload.new as DbStorageLocation))
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "storage_locations", filter: `user_id=eq.${userId}` },
        (payload) => callbacks.onDelete((payload.old as { id: string }).id)
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])
}
