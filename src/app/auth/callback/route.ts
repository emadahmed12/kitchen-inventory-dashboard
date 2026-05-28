/**
 * OAuth callback handler.
 *
 * After Google (or any other OAuth provider) redirects back to the app,
 * Supabase sends the auth `code` here. This handler exchanges it for a
 * session and redirects the user to their destination.
 *
 * This route is intentionally locale-free so the Supabase dashboard
 * callback URL doesn't need to include a locale prefix.
 */

import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to the original destination (or home)
      const redirectUrl = new URL(next, origin)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Auth failed — redirect to login with an error hint
  const loginUrl = new URL("/ar/auth/login", origin)
  loginUrl.searchParams.set("error", "auth_callback_error")
  return NextResponse.redirect(loginUrl)
}
