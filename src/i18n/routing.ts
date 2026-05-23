import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  // Default locale gets no /ar prefix in the URL; English uses /en/
  localePrefix: "as-needed",
})

export type Locale = (typeof routing.locales)[number]
