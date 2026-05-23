"use client"

import { motion } from "framer-motion"
import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  className?: string
}

export function QuantityStepper({
  value,
  onChange,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl bg-muted/50 p-0.5 ring-1 ring-foreground/[0.06]",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 rounded-lg active:scale-95"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="تقليل"
      >
        <Minus className="size-3.5" strokeWidth={2} />
      </Button>
      <motion.span
        key={value}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="min-w-[1.75rem] text-center text-sm font-semibold tabular-nums"
      >
        {value.toLocaleString("ar-EG")}
      </motion.span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="size-7 rounded-lg active:scale-95"
        onClick={() => onChange(value + 1)}
        aria-label="زيادة"
      >
        <Plus className="size-3.5" strokeWidth={2} />
      </Button>
    </div>
  )
}
