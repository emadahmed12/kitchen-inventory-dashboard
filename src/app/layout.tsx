/**
 * Minimal root layout required by Next.js.
 * The real layout lives in app/[locale]/layout.tsx which handles
 * lang/dir, fonts, metadata, and providers per locale.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
