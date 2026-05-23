"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { useInventoryStore } from "@/store/inventory-store"

type ShellContextValue = {
  commandOpen: boolean
  setCommandOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  registerAddItem: (handler: (() => void) | null) => void
  triggerAddItem: () => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const addItemRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const onUpdate = () => {
      useInventoryStore.persist.rehydrate()
    }
    window.addEventListener("storage", onUpdate)
    window.addEventListener("inventory-updated", onUpdate)
    return () => {
      window.removeEventListener("storage", onUpdate)
      window.removeEventListener("inventory-updated", onUpdate)
    }
  }, [])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", down)
    return () => window.removeEventListener("keydown", down)
  }, [])

  const registerAddItem = useCallback((handler: (() => void) | null) => {
    addItemRef.current = handler
  }, [])

  const triggerAddItem = useCallback(() => {
    addItemRef.current?.()
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((c) => !c)
  }, [])

  const value = useMemo(
    () => ({
      commandOpen,
      setCommandOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      registerAddItem,
      triggerAddItem,
      searchQuery,
      setSearchQuery,
    }),
    [
      commandOpen,
      sidebarCollapsed,
      registerAddItem,
      triggerAddItem,
      searchQuery,
      toggleSidebar,
    ]
  )

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  )
}

export function useShell() {
  const ctx = useContext(ShellContext)
  if (!ctx) throw new Error("useShell must be used within ShellProvider")
  return ctx
}
