/**
 * Locale-aware navigation utilities.
 * Import Link, redirect, usePathname, and useRouter from here
 * instead of next/navigation or next/link so locale prefixes are
 * handled automatically.
 */
import { createNavigation } from "next-intl/navigation"
import { routing } from "./routing"

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
