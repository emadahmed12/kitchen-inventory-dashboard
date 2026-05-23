/**
 * Next.js 16 Proxy (replaces middleware.ts).
 * next-intl's createMiddleware handles locale detection, cookie syncing,
 * and URL rewriting so the [locale] segment is always populated.
 */
import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"

const intlMiddleware = createMiddleware(routing)

export function proxy(
  request: Parameters<typeof intlMiddleware>[0]
) {
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Match all pathnames except Next.js internals and static files
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
}
