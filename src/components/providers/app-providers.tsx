"use client"

import { Toaster } from "sonner"
import { MotionConfig } from "framer-motion"

import { ShellProvider } from "@/contexts/shell-context"
import { ThemeProvider } from "@/components/providers/theme-provider"

type AppProvidersProps = {
  children: React.ReactNode
  dir?: "ltr" | "rtl"
}

export function AppProviders({ children, dir = "rtl" }: AppProvidersProps) {
  return (
    <ThemeProvider>
      {/* reducedMotion="user" collapses transform animations to opacity-only
          for users with prefers-reduced-motion enabled */}
      <MotionConfig reducedMotion="user">
      <ShellProvider>
        {children}
        <Toaster
          position="top-center"
          dir={dir}
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
      </MotionConfig>
    </ThemeProvider>
  )
}
