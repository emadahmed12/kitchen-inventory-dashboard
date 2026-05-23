"use client"

import { useCallback, useEffect, useState } from "react"
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

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return
    // User already dismissed
    if (localStorage.getItem(DISMISS_KEY)) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    if (ios) {
      const t = setTimeout(() => setShow(true), SHOW_DELAY_MS)
      return () => clearTimeout(t)
    }

    // Android / Chrome — wait for the browser's install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      const t = setTimeout(() => setShow(true), SHOW_DELAY_MS)
      return () => clearTimeout(t)
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
      aria-label="تثبيت التطبيق"
      className="fixed bottom-20 start-4 end-4 z-40 md:bottom-6 md:start-auto md:end-6 md:w-80"
    >
      <div className="glass-card rounded-2xl border border-border/50 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Download className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">تثبيت مطبخي</p>

            {isIOS ? (
              <>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  اضغط على زر{" "}
                  <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                    <Share className="h-3.5 w-3.5" />
                    مشاركة
                  </span>{" "}
                  في سفاري، ثم اختر{" "}
                  <span className="inline-flex items-center gap-0.5 font-medium text-foreground">
                    <Plus className="h-3.5 w-3.5" />
                    إضافة للشاشة الرئيسية
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-xs text-muted-foreground">
                  أضف التطبيق للشاشة الرئيسية للوصول السريع دون إنترنت
                </p>
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="mt-3 h-8 rounded-xl px-4 text-xs"
                >
                  تثبيت الآن
                </Button>
              </>
            )}
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            aria-label="إغلاق"
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
