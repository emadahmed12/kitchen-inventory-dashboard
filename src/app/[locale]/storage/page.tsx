import { getTranslations } from "next-intl/server"

export default async function StoragePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pages.storage" })
  return (
    <div className="mx-auto max-w-6xl space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{t("title")}</h1>
      <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
    </div>
  )
}
