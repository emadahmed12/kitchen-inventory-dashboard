"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Moon, Plus, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { useShell } from "@/contexts/shell-context"
import { navItems } from "@/components/layout/nav-config"
import { Input } from "@/components/ui/input"
import { getCategoryIcon } from "@/lib/inventory/icons"
import { getLocationLabel } from "@/lib/inventory/catalog-helpers"
import { useInventoryStore } from "@/store/inventory-store"
import { cn } from "@/lib/utils"

export function CommandPalette() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { commandOpen, setCommandOpen, triggerAddItem, setSearchQuery } =
    useShell()
  const inventoryItems = useInventoryStore((s) => s.items)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!commandOpen) setQuery("")
  }, [commandOpen])

  const productResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return inventoryItems.slice(0, 6)
    return inventoryItems
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.notes?.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          getLocationLabel(i.location).toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [inventoryItems, query])

  const actions = [
    {
      id: "add",
      label: "إضافة منتج",
      icon: Plus,
      run: () => {
        setCommandOpen(false)
        triggerAddItem()
      },
    },
    {
      id: "theme",
      label: resolvedTheme === "dark" ? "وضع فاتح" : "وضع داكن",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      run: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark")
        setCommandOpen(false)
      },
    },
  ]

  function go(href: string) {
    setCommandOpen(false)
    router.push(href)
  }

  function openProduct(name: string) {
    setSearchQuery(name)
    setCommandOpen(false)
    router.push("/inventory")
  }

  return (
    <AnimatePresence>
      {commandOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/25 backdrop-blur-sm"
            onClick={() => setCommandOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[12%] left-1/2 z-[101] w-[min(32rem,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border/50 bg-popover/95 shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
              <Search className="size-4 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث عن منتج أو أمر..."
                className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
              <kbd className="hidden rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
                ⌘K
              </kbd>
            </div>

            <div className="max-h-[min(24rem,60vh)] overflow-y-auto p-2">
              <Section title="إجراءات سريعة">
                {actions.map((action) => (
                  <CommandRow
                    key={action.id}
                    icon={action.icon}
                    label={action.label}
                    onClick={action.run}
                  />
                ))}
              </Section>

              <Section title="التنقل">
                {navItems.map((item) => (
                  <CommandRow
                    key={item.href}
                    icon={item.icon}
                    label={item.title}
                    onClick={() => go(item.href)}
                  />
                ))}
              </Section>

              <Section title="المنتجات">
                {productResults.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                    لا توجد نتائج
                  </p>
                ) : (
                  productResults.map((item) => {
                    const Icon = getCategoryIcon(item.category)
                    return (
                      <CommandRow
                        key={item.id}
                        icon={Icon}
                        label={item.name}
                        hint={getLocationLabel(item.location)}
                        onClick={() => openProduct(item.name)}
                      />
                    )
                  })
                )}
              </Section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-2">
      <p className="px-2 py-1.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

function CommandRow({
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  hint?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm",
        "transition-colors hover:bg-accent active:scale-[0.99]"
      )}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-muted/60">
        <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      {hint && (
        <span className="truncate text-xs text-muted-foreground">{hint}</span>
      )}
    </button>
  )
}
