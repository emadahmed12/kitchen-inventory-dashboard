/**
 * TypeScript types matching the Supabase database schema.
 * These mirror the `public` schema defined in supabase/migrations/001_schema.sql.
 *
 * The structure follows the exact shape expected by @supabase/supabase-js generics
 * so that the typed client resolves insert/update argument types correctly.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type InventoryStatus = "healthy" | "opened" | "low" | "almost_finished"

type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: Relationship[]
      }

      inventory_items: {
        Row: {
          id: string
          user_id: string
          name: string
          quantity: number
          unit: string
          category: string
          location: string
          status: InventoryStatus
          low_stock_threshold: number
          notes: string | null
          tags: string[]
          metadata: Json
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          quantity?: number
          unit?: string
          category?: string
          location?: string
          status?: InventoryStatus
          low_stock_threshold?: number
          notes?: string | null
          tags?: string[]
          metadata?: Json
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          quantity?: number
          unit?: string
          category?: string
          location?: string
          status?: InventoryStatus
          low_stock_threshold?: number
          notes?: string | null
          tags?: string[]
          metadata?: Json
          image_url?: string | null
          updated_at?: string
        }
        Relationships: Relationship[]
      }

      activity_logs: {
        Row: {
          id: string
          user_id: string
          item_id: string | null
          item_name: string | null
          action: string
          changes: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_id?: string | null
          item_name?: string | null
          action: string
          changes?: Json
          created_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: Relationship[]
      }

      shopping_list_items: {
        Row: {
          id: string
          user_id: string
          name: string
          quantity: number
          unit: string | null
          is_checked: boolean
          source_item_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          quantity?: number
          unit?: string | null
          is_checked?: boolean
          source_item_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          quantity?: number
          unit?: string | null
          is_checked?: boolean
          source_item_id?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: Relationship[]
      }

      storage_locations: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          capacity: number
          color: string | null
          icon: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: string
          capacity?: number
          color?: string | null
          icon?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          type?: string
          capacity?: number
          color?: string | null
          icon?: string | null
          updated_at?: string
        }
        Relationships: Relationship[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type DbInventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"]
export type DbInventoryItemInsert = Database["public"]["Tables"]["inventory_items"]["Insert"]
export type DbProfile = Database["public"]["Tables"]["profiles"]["Row"]
export type DbActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"]
export type DbStorageLocation = Database["public"]["Tables"]["storage_locations"]["Row"]
