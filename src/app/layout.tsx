import type { Metadata, Viewport } from "next"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

import { AppShell } from "@/components/layout/app-shell"
import { PWAInstallPrompt } from "@/components/pwa/install-prompt"
import { PWARegister } from "@/components/pwa/pwa-register"
import { AppProviders } from "@/components/providers/app-providers"
import "./globals.css"

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

// Viewport is exported separately from metadata (Next.js 16 requirement)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1929" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light dark",
  // cover lets the app extend edge-to-edge on notched devices;
  // safe-area CSS env() vars then pull content back from the notch/home indicator.
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://kitchen-inventory-dashboard.vercel.app"
  ),
  title: {
    default: "مطبخي — إدارة المخزون",
    template: "%s | مطبخي",
  },
  description:
    "تطبيق ذكي لإدارة مخزون مطبخك. تتبع المنتجات، تنبيهات نفاد المخزون، وتنظيم قائمة مشترياتك.",
  applicationName: "مطبخي",
  authors: [{ name: "مطبخي" }],
  keywords: [
    "مخزون المطبخ",
    "إدارة المطبخ",
    "تتبع المنتجات",
    "قائمة التسوق",
    "تطبيق المطبخ",
  ],
  // Tells browsers this is a PWA manifest
  manifest: "/manifest.webmanifest",
  // Apple-specific PWA tags
  appleWebApp: {
    capable: true,
    title: "مطبخي",
    statusBarStyle: "black-translucent",
    startupImage: "/icons/apple-touch-icon.png",
  },
  // Prevent phone number detection
  formatDetection: { telephone: false },
  // Open Graph
  openGraph: {
    type: "website",
    siteName: "مطبخي",
    title: "مطبخي — إدارة المخزون",
    description: "تطبيق ذكي لإدارة مخزون مطبخك",
    locale: "ar_SA",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "مطبخي — لوحة تحكم مخزون المطبخ",
      },
    ],
  },
  // Twitter / X card
  twitter: {
    card: "summary",
    title: "مطبخي — إدارة المخزون",
    description: "تطبيق ذكي لإدارة مخزون مطبخك",
    images: ["/icons/icon-512.png"],
  },
  // Misc platform tags
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#1e1c30",
    "msapplication-TileImage": "/icons/icon-192.png",
    "msapplication-tap-highlight": "no",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${arabic.variable} h-full antialiased`}
    >
      <head>
        {/* Apple touch icon — Next.js metadata API doesn't expose apple-touch-icon directly */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-dvh font-sans">
        <AppProviders>
          <AppShell>{children}</AppShell>
          <PWAInstallPrompt />
        </AppProviders>
        <PWARegister />
      </body>
    </html>
  )
}
