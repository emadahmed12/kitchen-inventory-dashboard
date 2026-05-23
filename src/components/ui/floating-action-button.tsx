"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FloatingActionButtonProps = {
  onClick: () => void
  label?: string
  className?: string
}

export function FloatingActionButton({
  onClick,
  label = "إضافة",
  className,
}: FloatingActionButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        // Fixed, above everything else
        "fixed z-50 md:hidden",
        // bottom-safe accounts for iPhone home indicator via env(safe-area-inset-bottom)
        "bottom-safe",
        // start-4: inline-start edge — right side in RTL, left side in LTR
        "start-4",
        className
      )}
      // Inline safe-area fallback for browsers that don't parse env() in Tailwind
      style={{ bottom: "max(1.5rem, calc(1.5rem + env(safe-area-inset-bottom, 0px)))" }}
    >
      <Button
        size="lg"
        className="h-12 gap-2 rounded-2xl px-5 shadow-xl shadow-primary/20 active:scale-[0.97]"
        onClick={onClick}
      >
        <Plus className="size-5" strokeWidth={2} />
        {label}
      </Button>
    </motion.div>
  )
}
