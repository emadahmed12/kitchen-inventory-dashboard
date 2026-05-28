"use client"

import { useTranslations } from "next-intl"
import { LogOut, Settings } from "lucide-react"
import { motion } from "framer-motion"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SUPABASE_ENABLED } from "@/lib/supabase/config"
import { signOut, useAuth } from "@/hooks/use-auth"
import { Link } from "@/i18n/navigation"

type UserMenuProps = {
  /** Static fallback values from server-side layout (avoids flash). */
  initialName?: string
  initialInitial?: string
}

export function UserMenu({ initialName, initialInitial }: UserMenuProps) {
  const t = useTranslations("auth")
  const tTopbar = useTranslations("topbar")
  const { user, profile } = useAuth()

  const displayName =
    profile?.display_name ??
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    initialName ??
    tTopbar("userName")

  const initial =
    displayName.charAt(0).toUpperCase() ??
    initialInitial ??
    tTopbar("userInitial")

  const avatarUrl =
    profile?.avatar_url ?? user?.user_metadata?.avatar_url ?? null

  if (!SUPABASE_ENABLED) {
    // Dev mode — show a static placeholder avatar
    return (
      <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
        <span className="text-xs font-semibold text-primary">
          {tTopbar("userInitial")}
        </span>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="rounded-xl" aria-label={t("profile")}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Avatar className="size-7">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="size-full rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initial}
                </AvatarFallback>
              )}
            </Avatar>
          </motion.div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[12rem] rounded-2xl">
        {user && (
          <>
            <div className="px-3 py-2">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex gap-2">
            <Settings className="size-4 text-muted-foreground" strokeWidth={1.75} />
            {t("settings")}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut()}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" strokeWidth={1.75} />
          {t("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
