import type { Metadata, Viewport } from "next"
import { Cairo, Inter } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { PWARegister } from "@/components/pwa/pwa-register"
import { PWAInstallPrompt } from "@/components/pwa/install-prompt"
import { AppProviders } from "@/components/providers/app-providers"
import { routing } from "@/i18n/routing"
import type { Locale } from "@/i18n/routing"
import "../globals.css"

// Cairo — Arabic
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

// Inter — English
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1929" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  viewportFit: "cover",
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_APP_URL ?? "https://kitchen-inventory-dashboard.vercel.app"
    ),
    title: {
      default: t("title"),
      template: `%s | ${t("appName")}`,
    },
    description: t("appDescription"),
    applicationName: t("appName"),
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: t("appName"),
      statusBarStyle: "black-translucent",
      startupImage: "/icons/apple-touch-icon.png",
    },
    formatDetection: { telephone: false },
    openGraph: {
      type: "website",
      siteName: t("appName"),
      title: t("title"),
      description: t("appDescription"),
      locale: locale === "ar" ? "ar_SA" : "en_US",
      images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: t("appName") }],
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("appDescription"),
      images: ["/icons/icon-512.png"],
    },
    other: {
      "mobile-web-app-capable": "yes",
      "msapplication-TileColor": "#1e1c30",
      "msapplication-TileImage": "/icons/icon-192.png",
      "msapplication-tap-highlight": "no",
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()
  const isRTL = locale === "ar"
  const font = isRTL ? cairo : inter

  return (
    <html
      lang={locale}
      dir={isRTL ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${font.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-dvh font-sans">
        <NextIntlClientProvider messages={messages}>
          {/*
            AppShell is mounted in [locale]/(app)/layout.tsx so auth pages
            (/auth/*) render without the sidebar/topbar shell.
          */}
          <AppProviders dir={isRTL ? "rtl" : "ltr"}>
            {children}
            <PWAInstallPrompt />
          </AppProviders>
        </NextIntlClientProvider>
        <PWARegister />
      </body>
    </html>
  )
}
