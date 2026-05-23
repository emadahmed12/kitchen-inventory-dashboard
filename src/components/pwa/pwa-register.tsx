"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        // Check for updates whenever the tab regains focus
        const onFocus = () => reg.update()
        window.addEventListener("focus", onFocus)
        return () => window.removeEventListener("focus", onFocus)
      })
      .catch((err) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[PWA] Service worker registration failed:", err)
        }
      })
  }, [])

  return null
}
