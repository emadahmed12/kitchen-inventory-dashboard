"use client"

import { Toaster } from "sonner"

import { ShellProvider } from "@/contexts/shell-context"
import { ThemeProvider } from "@/components/providers/theme-provider"

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ShellProvider>
        {children}
        <Toaster
          position="top-center"
          dir="rtl"
          toastOptions={{
            classNames: {
              toast:
                "glass-card rounded-2xl border-border/50 font-sans shadow-lg",
              title: "text-sm font-medium",
              description: "text-xs text-muted-foreground",
            },
          }}
          richColors
          closeButton
        />
      </ShellProvider>
    </ThemeProvider>
  )
}
