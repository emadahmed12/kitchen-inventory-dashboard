"use client"

import { useCallback, useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Download, Plus, Share, X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

const DISMISS_KEY = "pwa-install-dismissed-v1"
const SHOW_DELAY_MS = 5000

export function PWAInstallPrompt() {
  const [show, setShow] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const t = useTranslations("pwa")

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return
    if (localStorage.getItem(DISMISS_KEY)) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      const timer = setTimeout(() => setShow(true), SHOW_DELAY_MS)
      return () => clearTimeout(timer)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      const timer = setTimeout(() => setShow(true), SHOW_DELAY_MS)
      return () => clearTimeout(timer)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === "accepted") setShow(false)
    setPrompt(null)
  }, [prompt])

  const handleDismiss = useCallback(() => {
    setShow(false)
    localStorage.setItem(DISMISS_KEY, "1")
  }, [])

  if (!show) return null

  return (
    <div
      role="dialog"
      aria-label={t("installTitle")}
      className="fixed bottom-20 start-4 end-4 z-40 md:bottom-6 md:start-auto md:end-6 md:w-80"
    >
      <div className="glass-card rounded-2xl border border-border/50 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Download className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("installTitle")}</p>
            {isIOS ? (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t("iosInstructions")}
              </p>
            ) : (
              <>
                <p className="mt-1 text-xs text-muted-foreground">{t("installBody")}</p>
                <Button size="sm" onClick={handleInstall} className="mt-3 h-8 rounded-xl px-4 text-xs">
                  {t("installNow")}
                </Button>
              </>
            )}
          </div>
          <button onClick={handleDismiss} aria-label={t("dismiss")} className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
