"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"

import { CommandPalette } from "@/components/command/command-palette"
import { PageTransition } from "@/components/layout/page-transition"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { FloatingActionButton } from "@/components/ui/floating-action-button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useShell } from "@/contexts/shell-context"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { sidebarCollapsed, triggerAddItem } = useShell()
  const showFab = pathname === "/inventory"

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative min-h-dvh">
        <div
          className="ambient-bg pointer-events-none fixed inset-0 -z-10"
          aria-hidden
        />

        <div className="flex min-h-dvh">
          <div
            className={cn(
              "glass-sidebar sticky top-0 hidden h-dvh shrink-0 border-e border-sidebar-border/50 md:block",
              sidebarCollapsed ? "w-[4.25rem]" : "w-[16.5rem]"
            )}
          >
            <Sidebar />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar onMenuClick={() => setMobileOpen(true)} />
            <main className="flex-1 px-3 py-4 md:px-6 md:py-6">
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="right"
            className="glass-sidebar w-[min(17rem,88vw)] border-sidebar-border/50 p-0 sm:max-w-xs"
          >
            <Sidebar onNavigate={() => setMobileOpen(false)} collapsed={false} />
          </SheetContent>
        </Sheet>

        <CommandPalette />

        {showFab && (
          <FloatingActionButton
            onClick={triggerAddItem}
            label="إضافة منتج"
          />
        )}
      </div>
    </TooltipProvider>
  )
}
