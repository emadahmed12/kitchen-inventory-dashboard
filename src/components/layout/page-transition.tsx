"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

import { pageTransition } from "@/lib/motion"

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} {...pageTransition} className="flex-1">
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
