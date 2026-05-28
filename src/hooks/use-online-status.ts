"use client"

import { useEffect, useState } from "react"

/**
 * Returns `true` when the browser has network access.
 * Starts with `true` on the server (SSR) to avoid hydration mismatch.
 *
 * Listens to `online`/`offline` window events and updates in real time.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Sync to the actual browser state after hydration
    setOnline(navigator.onLine)

    function handleOnline() { setOnline(true) }
    function handleOffline() { setOnline(false) }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  return online
}
