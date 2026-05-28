/**
 * Structured logger.
 *
 * In development: pretty-prints to the console.
 * In production:  sends events to Sentry (if configured) and console.
 *
 * Usage:
 *   import { logger } from "@/lib/logger"
 *   logger.info("Items loaded", { count: 26 })
 *   logger.error("Sync failed", error)
 */

type Level = "debug" | "info" | "warn" | "error"
type LogContext = Record<string, unknown>

const IS_DEV = process.env.NODE_ENV !== "production"

function buildMessage(level: Level, message: string, context?: LogContext): string {
  const ts = new Date().toISOString()
  const ctx = context ? ` ${JSON.stringify(context)}` : ""
  return `[${ts}] [${level.toUpperCase()}] ${message}${ctx}`
}

/** Map our level names to Sentry's expected level strings. */
function toSentryLevel(level: Level): "debug" | "info" | "warning" | "error" | "fatal" {
  return level === "warn" ? "warning" : level
}

function sendToSentry(level: Level, message: string, error?: unknown, context?: LogContext) {
  // Sentry is loaded via sentry.client.config.ts / sentry.server.config.ts
  // This dynamic import avoids bundling Sentry when it isn't configured.
  if (typeof window === "undefined") return // skip on server side (handled separately)
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

  const sentryLevel = toSentryLevel(level)
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.withScope((scope) => {
      if (context) scope.setExtras(context)
      scope.setLevel(sentryLevel)
      if (error instanceof Error) {
        Sentry.captureException(error)
      } else {
        Sentry.captureMessage(message, sentryLevel)
      }
    })
  }).catch(() => {/* Sentry not available */})
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (!IS_DEV) return
    console.debug(buildMessage("debug", message, context))
  },

  info(message: string, context?: LogContext) {
    console.info(buildMessage("info", message, context))
  },

  warn(message: string, context?: LogContext) {
    console.warn(buildMessage("warn", message, context))
    sendToSentry("warn", message, undefined, context)
  },

  error(message: string, error?: unknown, context?: LogContext) {
    const ctx = error instanceof Error
      ? { ...context, errorMessage: error.message, stack: error.stack }
      : context
    console.error(buildMessage("error", message, ctx), error)
    sendToSentry("error", message, error, context)
  },
}
