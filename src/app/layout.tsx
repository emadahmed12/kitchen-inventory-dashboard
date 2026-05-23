import type { Metadata } from "next"
import { IBM_Plex_Sans_Arabic } from "next/font/google"

import { AppShell } from "@/components/layout/app-shell"
import { AppProviders } from "@/components/providers/app-providers"
import "./globals.css"

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "مطبخي — إدارة المخزون",
  description: "لوحة تحكم مخزون المطبخ",
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
      <body className="min-h-dvh font-sans">
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  )
}
