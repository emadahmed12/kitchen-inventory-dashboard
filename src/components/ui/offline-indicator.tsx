"use client"

import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { WifiOff } from "lucide-react"

import { useOnlineStatus } from "@/hooks/use-online-status"

/**
 * Thin banner that slides in from the top when the user goes offline.
 * Disappears automatically when the connection is restored.
 */
export function OfflineIndicator() {
  const t = useTranslations("error")
  const online = useOnlineStatus()

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          key="offline-banner"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="alert"
          aria-live="assertive"
          className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-medium text-white"
        >
          <WifiOff className="size-3.5" strokeWidth={2} />
          {t("offline")}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
