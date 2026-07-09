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
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          role="alert"
          aria-live="assertive"
          // In normal flow (not fixed) so it pushes the app down instead of
          // covering the topbar — navigation stays reachable while offline.
          className="w-full shrink-0 overflow-hidden bg-amber-500 text-white"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium">
            <WifiOff className="size-3.5" strokeWidth={2} />
            {t("offline")}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
