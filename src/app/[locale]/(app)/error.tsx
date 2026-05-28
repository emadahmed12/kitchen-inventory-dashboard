"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { AlertCircle, Home, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

/**
 * Route-level error boundary for all authenticated app pages.
 * Shown when a Server Component or page throws an unhandled error.
 * Must be a Client Component — receives `error` and `reset` from Next.js.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations("error")

  useEffect(() => {
    // Log to console in development; replace with Sentry in production
    console.error("[AppError boundary]", error)
  }, [error])

  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex max-w-md flex-col items-center gap-5"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
          <AlertCircle className="size-7 text-destructive" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/50 font-mono">
              {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={reset} className="gap-2 rounded-xl">
            <RotateCcw className="size-4" strokeWidth={1.75} />
            {t("retry")}
          </Button>
          <Button variant="outline" asChild className="gap-2 rounded-xl">
            <Link href="/">
              <Home className="size-4" strokeWidth={1.75} />
              {t("home")}
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
