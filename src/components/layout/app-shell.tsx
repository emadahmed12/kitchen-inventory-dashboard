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
      {/*
       * Outer shell: exact viewport height, no overflow.
       * Using h-dvh (dynamic viewport height) so the layout tracks
       * the Android Chrome URL bar show/hide correctly.
       * overflow-hidden prevents any child from causing horizontal scroll.
       */}
      <div className="relative flex h-dvh w-full flex-col overflow-hidden">
        {/* Ambient background — fixed behind all content */}
        <div
          className="ambient-bg pointer-events-none fixed inset-0 -z-10"
          aria-hidden
        />

        {/* Main row: sidebar + content */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Desktop sidebar — hidden on mobile, full height on md+ */}
          <div
            className={cn(
              "glass-sidebar hidden h-full shrink-0 border-e border-sidebar-border/50 md:flex md:flex-col",
              sidebarCollapsed ? "w-[4.25rem]" : "w-[16.5rem]"
            )}
          >
            <Sidebar />
          </div>

          {/*
           * Content column: topbar + scrollable main.
           * overflow-hidden on the column prevents sidebar-bleed,
           * overflow-y-auto on main is the ONLY scroll surface.
           */}
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <Topbar onMenuClick={() => setMobileOpen(true)} />

            <main
              className={cn(
                "flex-1 overflow-x-hidden overflow-y-auto",
                "scroll-touch", // momentum scrolling + contain overscroll
                "px-3 py-4 md:px-6 md:py-6",
                // Extra bottom padding so FAB / safe area never covers last card
                showFab && "pb-24 md:pb-8"
              )}
            >
              <PageTransition>{children}</PageTransition>
            </main>
          </div>
        </div>

        {/* Mobile sheet sidebar — slides from the inline-start edge (right in RTL) */}
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
