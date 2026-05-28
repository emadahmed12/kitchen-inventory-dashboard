import { getTranslations } from "next-intl/server"
import { ChefHat } from "lucide-react"
import { AuthForm } from "@/components/auth/auth-form"

type LoginPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string; error?: string }>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auth" })
  return { title: t("signIn") }
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params
  const { next } = await searchParams
  const t = await getTranslations({ locale, namespace: "auth" })

  const redirectTo = next ?? (locale === "en" ? "/en" : "/")

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-12">
      {/* Ambient background */}
      <div className="ambient-bg pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <ChefHat className="size-7 text-primary" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        {/* Auth form card */}
        <div className="glass-card rounded-3xl border border-border/50 p-6 shadow-xl">
          <AuthForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  )
}
