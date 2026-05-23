"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { CommandPalette } from "@/components/command/command-palette"
import { PageTransition } from "@/components/layout/page-transition"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useShell } from "@/contexts/shell-context"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { sidebarCollapsed, triggerAddItem } = useShell()
  const t = useTranslations("sidebar")
  const tInv = useTranslations("inventory")

  // Match both /inventory and /en/inventory
  const showFab = pathname.endsWith("/inventory")

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative flex h-dvh w-full flex-col overflow-hidden">
        <div className="ambient-bg pointer-events-none fixed inset-0 -z-10" aria-hidden />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div
            className={cn(
              "glass-sidebar hidden h-full shrink-0 border-e border-sidebar-border/50 md:flex md:flex-col",
              sidebarCollapsed ? "w-[4.25rem]" : "w-[16.5rem]"
            )}
          >
            <Sidebar />
          </div>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Topbar onMenuClick={() => setMobileOpen(true)} />
            <main
              className={cn(
                "flex-1 overflow-x-hidden overflow-y-auto scroll-touch",
                "px-3 py-4 md:px-6 md:py-6",
                showFab && "pb-24 md:pb-8"
              )}
            >
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="right"
            className="glass-sidebar w-[min(17rem,88vw)] border-sidebar-border/50 p-0 sm:max-w-xs"
          >
            <VisuallyHidden.Root asChild>
              <SheetTitle>{t("navLabel")}</SheetTitle>
            </VisuallyHidden.Root>
            <Sidebar onNavigate={() => setMobileOpen(false)} collapsed={false} />
          </SheetContent>
        </Sheet>

        <CommandPalette />

        {showFab && (
          <FloatingActionButton onClick={triggerAddItem} label={tInv("addItem")} />
        )}
      </div>
    </TooltipProvider>
  )
}
