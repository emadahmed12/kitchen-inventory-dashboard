"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

import { Link } from "@/i18n/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  title: string
  value: string
  hint?: string
  icon: LucideIcon
  index?: number
  /** When supplied the card becomes a navigation link. */
  href?: string
  /** Accessible description for screen readers. */
  ariaLabel?: string
}

export function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  index = 0,
  href,
  ariaLabel,
}: StatCardProps) {
  const card = (
    <Card
      className={cn(
        "glass-card rounded-3xl border-border/30 py-0 shadow-sm",
        "transition-all duration-300 hover:shadow-md",
        href && "cursor-pointer hover:border-border/60 hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-4 px-5 pt-5 pb-0">
        <div className="space-y-1.5">
          <CardDescription className="text-xs font-medium">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </CardTitle>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted/50 ring-1 ring-foreground/[0.06]">
          <Icon className="size-5 text-muted-foreground" strokeWidth={1.75} />
        </div>
      </CardHeader>
      {hint && (
        <CardContent className="px-5 pt-2 pb-5">
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      )}
    </Card>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
    >
      {href ? (
        <Link
          href={href}
          aria-label={ariaLabel ?? title}
          tabIndex={0}
          className="block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {card}
        </Link>
      ) : (
        card
      )}
    </motion.div>
  )
}
