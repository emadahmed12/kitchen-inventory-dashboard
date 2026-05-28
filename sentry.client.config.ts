/**
 * Sentry client-side configuration.
 *
 * This file is loaded automatically by @sentry/nextjs when the app boots in
 * the browser. It is safe to leave NEXT_PUBLIC_SENTRY_DSN unset — Sentry
 * initialisation is skipped when the DSN is absent.
 *
 * To enable Sentry:
 *  1. Create a project at https://sentry.io
 *  2. Add NEXT_PUBLIC_SENTRY_DSN to your .env.local and Vercel env vars
 */

import * as Sentry from "@sentry/nextjs"

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NODE_ENV,

    // Capture 100% of transactions in dev, 10% in production
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

    // Replay 1% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
  })
}
