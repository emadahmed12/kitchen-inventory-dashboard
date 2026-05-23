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
        "fixed bottom-6 left-4 z-50 md:hidden",
        className
      )}
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
