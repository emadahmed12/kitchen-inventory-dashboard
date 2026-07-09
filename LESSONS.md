# Lessons

Design and engineering mistakes we've already paid for — don't repeat them.

## RTL / bilingual

- **Never hardcode UI strings in components** — even "obviously Arabic-only"
  ones. A hardcoded `منتج/منتجات` ternary shipped to the English UI.
  Every string goes through next-intl; counts use ICU plurals
  (Arabic needs zero/one/two/few/many/other).
- **English pluralization needs ICU too.** `"{count} item"` shipped
  "26 item" for months. Any key containing a count gets `{count, plural, …}`.
- **Physical CSS values break in one direction.** Shadows (`4px 0 …`),
  `side="left"` tooltips, and `PanelRight*` icons all need direction-aware
  handling (`[dir="rtl"]` overrides or a `useLocale()` switch).
- **SVG inside RTL pages mirrors `text-anchor`.** Recharts must be wrapped
  in `dir="ltr"` and given `fontFamily: var(--font-sans)` explicitly.

## Component wiring

- **A Radix trigger must be wrapped in `*Trigger asChild`.** A bare Button
  sitting inside `DropdownMenu` renders fine and does nothing — the
  notifications bell was dead in production. Click-test every popover.
- **Virtual filter values need their own labels.** `needsAttention` filtered
  correctly but displayed "All" because the label function had no branch
  for it. When adding a union member, grep every switch over that union.

## Hydration / production

- **`next/dynamic({ ssr: false })` with `.then()` chaining leaks a Suspense
  promise** to the route-level `loading.tsx` in Next.js 16 production —
  infinite skeleton. Prefer static imports; measure before lazy-loading.
- **Zustand `persist.hasHydrated()/onFinishHydration` are unreliable on
  Vercel production.** The only guaranteed hydration signal is
  `useEffect(() => setMounted(true), [])`.

## Design system

- **Consistency drifts one component at a time.** Radius (2xl vs 3xl on the
  same row), five different icon strokeWidths, hex colors bypassing tokens —
  each individually invisible. Check DESIGN_SYSTEM.md before styling
  anything new.
- **Empty states multiply.** Three treatments existed before
  `components/ui/empty-state.tsx`. Never inline a bespoke empty state.
- **Don't fake data for symmetry.** KPI trend hints exist only where honest
  history exists (`createdAt` → "+N this week" on Total). Status KPIs have
  no snapshots, so they show no trend.

## Accessibility

- Custom `<button>`s don't get focus rings for free — every one needs
  `focus-visible:ring-2 ring-ring`.
- Progress bars are invisible to screen readers without
  `role="progressbar"` + `aria-valuenow`.
- Touch targets below 40px fail one-handed mobile use (shopping steppers
  shipped at 28px).
- Fixed banners that cover the topbar take navigation away exactly when
  users need it (offline). Offset layout instead.
