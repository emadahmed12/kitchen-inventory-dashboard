"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  /** Optional call-to-action rendered below the description. */
  action?: React.ReactNode
  /** Accent treatment for the icon tile. */
  tone?: "neutral" | "success"
  className?: string
}

/**
 * The single empty-state treatment used across the app: dashed-border card,
 * icon tile, title, supporting copy, optional CTA.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  tone = "neutral",
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/50 bg-muted/15 px-6 py-20 text-center",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex size-16 items-center justify-center rounded-2xl",
          tone === "success"
            ? "bg-emerald-500/10 ring-1 ring-emerald-500/20"
            : "bg-muted/40 ring-1 ring-foreground/[0.06]"
        )}
      >
        <Icon
          className={cn(
            "size-7",
            tone === "success" ? "text-emerald-500" : "text-muted-foreground"
          )}
          strokeWidth={1.5}
        />
      </div>
      <p className="text-base font-semibold">{title}</p>
      {description && (
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
