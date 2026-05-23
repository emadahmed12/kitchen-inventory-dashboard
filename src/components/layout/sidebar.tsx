"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { ChefHat, PanelRightClose, PanelRightOpen } from "lucide-react"

import { Link } from "@/i18n/navigation"
import { navItems } from "@/components/layout/nav-config"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useShell } from "@/contexts/shell-context"
import { cn } from "@/lib/utils"

type SidebarProps = {
  className?: string
  onNavigate?: () => void
  collapsed?: boolean
}

export function Sidebar({ className, onNavigate, collapsed: collapsedProp }: SidebarProps) {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useShell()
  const collapsed = collapsedProp ?? sidebarCollapsed
  const t = useTranslations("nav")
  const ts = useTranslations("sidebar")

  return (
    <aside
      className={cn(
        "sidebar-gradient flex h-full shrink-0 flex-col transition-[width] duration-300 ease-out",
        collapsed ? "w-[4.25rem]" : "w-[16.5rem]",
        className
      )}
    >
      <div className={cn("flex items-center gap-3 px-3 pt-5 pb-3", collapsed && "justify-center px-2")}>
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-foreground/[0.06] to-foreground/[0.02] shadow-sm ring-1 ring-foreground/10"
        >
          <ChefHat className="size-5 text-foreground/80" strokeWidth={1.75} />
        </motion.div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">{ts("brandName")}</p>
            <p className="truncate text-xs text-muted-foreground">{ts("brandSubtitle")}</p>
          </motion.div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ms-auto hidden rounded-xl lg:flex"
            onClick={toggleSidebar}
            aria-label={ts("collapse")}
          >
            <PanelRightOpen className="size-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="mb-2 flex justify-center px-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-xl"
            onClick={toggleSidebar}
            aria-label={ts("expand")}
          >
            <PanelRightClose className="size-4" />
          </Button>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-0.5 px-2 py-2">
        {navItems.map((item, index) => {
          // Compare against pathname without locale prefix
          const active =
            item.href === "/"
              ? pathname === "/" || /^\/[a-z]{2}$/.test(pathname)
              : pathname.includes(item.href)
          const Icon = item.icon
          const title = t(item.titleKey)

          const link = (
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center rounded-2xl text-sm transition-colors duration-200",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5",
                active
                  ? "text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-2xl bg-sidebar-accent/90 shadow-sm ring-1 ring-foreground/[0.08]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <motion.span whileHover={{ scale: 1.08 }} className="relative z-10 flex shrink-0">
                <Icon
                  className={cn("size-[1.125rem]", active ? "text-foreground" : "text-muted-foreground")}
                  strokeWidth={1.75}
                />
              </motion.span>
              {!collapsed && <span className="relative z-10 font-medium">{title}</span>}
            </Link>
          )

          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="left">{title}</TooltipContent>
                </Tooltip>
              ) : (
                link
              )}
            </motion.div>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="mt-auto border-t border-sidebar-border/40 px-4 py-4">
          <p className="text-[0.65rem] leading-relaxed text-muted-foreground">{ts("footer")}</p>
        </div>
      )}
    </aside>
  )
}
