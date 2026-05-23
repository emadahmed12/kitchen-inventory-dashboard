"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { pageTransition } from "@/lib/motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        {...pageTransition}
        // w-full + min-w-0 ensures the div never exceeds the scroll container width.
        // min-h-0 prevents flex-child height collapse on some Android WebViews.
        className="w-full min-w-0 min-h-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
