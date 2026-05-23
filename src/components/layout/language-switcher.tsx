"use client"

import { useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Languages } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { routing } from "@/i18n/routing"
import { usePathname, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const t = useTranslations("language")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function switchLocale(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative rounded-xl"
          aria-label={t("switchLabel")}
          disabled={isPending}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={locale}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              {isPending ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Languages className="size-4" strokeWidth={1.75} />
              )}
            </motion.span>
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[7rem] rounded-xl">
        {routing.locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => switchLocale(l)}
            className="gap-2"
            aria-current={l === locale ? "true" : undefined}
          >
            <span
              className={
                l === locale
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground"
              }
            >
              {t(l as "ar" | "en")}
            </span>
            {l === locale && (
              <span className="ms-auto size-1.5 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
