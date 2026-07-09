"use client"

import { useState, useTransition } from "react"
import { useLocale, useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Languages, Palette, Database, Info, Sun, Moon, Monitor } from "lucide-react"

import { PageContainer } from "@/components/ui/page-container"
import { Button } from "@/components/ui/button"
import { routing } from "@/i18n/routing"
import { usePathname, useRouter } from "@/i18n/navigation"
import { useInventoryStore } from "@/store/inventory-store"
import { staggerContainer, staggerItem } from "@/lib/motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/40">
          <Icon className="size-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="ps-1">{children}</div>
    </div>
  )
}

export function SettingsPage() {
  const t = useTranslations("settings")
  const tLang = useTranslations("language")
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()
  const resetToSeed = useInventoryStore((s) => s.resetToSeed)
  const [resetOpen, setResetOpen] = useState(false)

  function switchLocale(next: string) {
    if (next === locale) return
    startTransition(() => router.replace(pathname, { locale: next }))
  }

  function handleReset() {
    resetToSeed()
    setResetOpen(false)
    toast.success(t("resetSuccess"))
  }

  const themes = [
    { id: "light" as const, label: t("light"), icon: Sun },
    { id: "dark" as const, label: t("dark"), icon: Moon },
    { id: "system" as const, label: t("system"), icon: Monitor },
  ]

  return (
    <PageContainer size="default" className="flex flex-col gap-5 md:gap-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-[1.75rem]">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-4"
      >
        {/* Language — segmented control, mirrors the theme picker pattern */}
        <motion.div variants={staggerItem}>
          <SettingsSection icon={Languages} title={t("language")} description={t("languageDesc")}>
            <div className="flex gap-2 flex-wrap">
              {routing.locales.map((l) => (
                <button
                  key={l}
                  onClick={() => switchLocale(l)}
                  aria-pressed={locale === l}
                  className={cn(
                    "rounded-xl border px-3.5 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    locale === l
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {tLang(l as "ar" | "en")}
                </button>
              ))}
            </div>
          </SettingsSection>
        </motion.div>

        {/* Theme */}
        <motion.div variants={staggerItem}>
          <SettingsSection icon={Palette} title={t("theme")} description={t("themeDesc")}>
            <div className="flex gap-2 flex-wrap">
              {themes.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    theme === id
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} />
                  {label}
                </button>
              ))}
            </div>
          </SettingsSection>
        </motion.div>

        {/* Data */}
        <motion.div variants={staggerItem}>
          <SettingsSection icon={Database} title={t("data")} description={t("dataDesc")}>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground/80">{t("resetDataDesc")}</p>
              <Button
                variant="destructive"
                size="sm"
                className="w-fit rounded-xl"
                onClick={() => setResetOpen(true)}
              >
                {t("resetData")}
              </Button>
            </div>
          </SettingsSection>
        </motion.div>

        {/* About */}
        <motion.div variants={staggerItem}>
          <SettingsSection icon={Info} title={t("about")} description={t("version")}>
            <p className="text-xs text-muted-foreground">{t("builtWith")}</p>
          </SettingsSection>
        </motion.div>
      </motion.div>

      {/* Reset confirmation dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="rounded-3xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("resetData")}</DialogTitle>
            <DialogDescription>{t("resetDataDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setResetOpen(false)} className="rounded-xl">
              {t("resetCancel")}
            </Button>
            <Button variant="destructive" onClick={handleReset} className="rounded-xl">
              {t("resetConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
