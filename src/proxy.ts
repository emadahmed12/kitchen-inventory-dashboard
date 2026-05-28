/**
 * Next.js 16 Proxy (replaces the classic middleware.ts).
 *
 * Responsibilities:
 * 1. i18n routing    — locale detection via next-intl's createMiddleware
 * 2. Session refresh — keeps Supabase JWTs alive on every request
 * 3. Route protection — redirects unauthenticated users to /auth/login
 *
 * When SUPABASE is not configured (dev / offline mode) steps 2 & 3 are
 * skipped and the proxy is a transparent i18n pass-through.
 */

import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import createIntlMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_ENABLED } from "@/lib/supabase/config"

const handleI18n = createIntlMiddleware(routing)

/** Path segments that never require authentication. */
const PUBLIC_SEGMENTS = ["/auth/", "/api/"]

function isPublicPath(pathname: string) {
  return PUBLIC_SEGMENTS.some((seg) => pathname.includes(seg))
}

function getLocale(pathname: string): string {
  const seg = pathname.split("/").filter(Boolean)[0]
  return seg === "en" ? "en" : "ar"
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 0. Skip both i18n and auth for non-localized routes ──────────────────
  // The OAuth callback and API routes are locale-free and must NOT be
  // rewritten by the i18n middleware (which would add a locale prefix).
  if (pathname.startsWith("/auth/") || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // ── 1. i18n routing (runs first — handles locale redirects) ──────────────
  const i18nResponse = handleI18n(request)

  // If next-intl wants to redirect (e.g., add locale prefix), honour it.
  if (i18nResponse.status !== 200) {
    return i18nResponse
  }

  // ── 2. Supabase auth (only when configured) ───────────────────────────────
  if (!SUPABASE_ENABLED) {
    return i18nResponse
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  // Must call getUser() — this is what refreshes the access token.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Unauthenticated → redirect to login
  if (!user && !isPublicPath(pathname)) {
    const locale = getLocale(pathname)
    const loginUrl = new URL(`/${locale}/auth/login`, request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated → redirect away from login page
  if (user && pathname.includes("/auth/login")) {
    const locale = getLocale(pathname)
    return NextResponse.redirect(new URL(locale === "en" ? "/en" : "/", request.url))
  }

  // Merge i18n headers (x-next-intl-locale, etc.) onto the auth response
  i18nResponse.headers.forEach((value, key) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icons|manifest|sw\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
}
