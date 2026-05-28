"use client"

import { useEffect, useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Command, Menu, Moon, Search, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Link } from "@/i18n/navigation"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { useShell } from "@/contexts/shell-context"
import { getLowStockItems } from "@/lib/inventory/stats"
import { useInventoryItems } from "@/hooks/use-inventory"
import { cn } from "@/lib/utils"

type TopbarProps = { onMenuClick?: () => void }

export function Topbar({ onMenuClick }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { setCommandOpen } = useShell()
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])
  const t = useTranslations("topbar")

  const inventoryItems = useInventoryItems()
  const alerts = useMemo(() => getLowStockItems(inventoryItems), [inventoryItems])

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="glass-bar sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border/40 px-3 md:gap-3 md:px-5"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        className="rounded-xl md:hidden"
        onClick={onMenuClick}
        aria-label={t("openMenu")}
      >
        <Menu className="size-5" strokeWidth={1.75} />
      </Button>

      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className={cn("relative hidden min-w-0 flex-1 items-center md:flex md:max-w-sm lg:max-w-md")}
      >
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
        />
        <div className="flex h-10 w-full items-center rounded-2xl border border-transparent bg-muted/40 ps-10 pe-20 text-sm text-muted-foreground transition-all duration-200 hover:border-border/40 hover:bg-background/60">
          {t("searchPlaceholder")}
        </div>
        <kbd className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-md bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border/60 sm:flex">
          <Command className="size-2.5" />K
        </kbd>
      </button>

      <div className="ms-auto flex items-center gap-0.5">
        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-xl md:hidden"
          onClick={() => setCommandOpen(true)}
          aria-label={t("searchButton")}
        >
          <Search className="size-4" strokeWidth={1.75} />
        </Button>

        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Theme toggle */}
        <motion.div whileTap={{ scale: 0.92 }}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative rounded-xl"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label={t("toggleTheme")}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mounted && resolvedTheme === "dark" ? "sun" : "moon"}
                initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="size-4" strokeWidth={1.75} />
                ) : (
                  <Moon className="size-4" strokeWidth={1.75} />
                )}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuContent align="end" className="w-72 rounded-2xl p-2">
            <p className="px-2 py-1.5 text-xs font-semibold">{t("notifications")}</p>
            {alerts.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                {t("noNotifications")}
              </p>
            ) : (
              alerts.map((item) => (
                <DropdownMenuItem key={item.id} asChild>
                  <Link href="/inventory" className="flex flex-col items-start gap-0.5">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{t("lowStock")}</span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
          <Button variant="ghost" size="icon-sm" className="relative rounded-xl" aria-label={t("notifications")}>
            <Bell className="size-4" strokeWidth={1.75} />
            {alerts.length > 0 && (
              <span className="absolute top-1 end-1 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-red-500" />
              </span>
            )}
          </Button>
        </DropdownMenu>

        {/* User menu — auth-aware */}
        <UserMenu />
      </div>
    </motion.header>
  )
}
