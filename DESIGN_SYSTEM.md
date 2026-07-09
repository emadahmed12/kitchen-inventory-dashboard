# Design System — Kitchen Inventory Dashboard

Single source of truth for visual decisions. All values live as CSS custom
properties in `src/app/globals.css`; this file documents how to use them.

## Color

OKLch tokens, light + dark defined separately (dark mode is designed, not inverted).

| Token | Use |
|---|---|
| `--background` / `--foreground` | Page canvas / body text |
| `--card`, `--popover`, `--muted`, `--accent` | Surfaces |
| `--primary` | Primary actions (near-black light / near-white dark) |
| `--destructive` | Delete / error only |
| `--status-healthy` / `--status-opened` / `--status-low` / `--status-almost-finished` | Inventory status — charts, badges, glows. Never hardcode status hex values. |
| `--chart-1..5` | Data visualisation fills |

Rules:
- New status UI must reference `var(--status-*)`, not Tailwind `emerald-500`/`amber-500` literals. (Legacy badge classes in `constants.ts` are grandfathered; migrate opportunistically.)
- Color is for meaning, not decoration. One accent per surface.

## Radius

Base: `--radius: 1rem`. Semantic map — do not mix levels:

| Level | Class | Used for |
|---|---|---|
| Card | `rounded-3xl` | Page-level cards: stat cards, chart cards, storage cards, dialogs, insights |
| Row | `rounded-2xl` | List rows, nav items, dropdown menus, search field |
| Control | `rounded-xl` | Buttons, inputs, selects, icon tiles, chips-with-borders |
| Chip | `rounded-lg` | Badges, tiny inline chips |

## Typography

- Fonts: Cairo (Arabic) / Inter (English) via `--font-sans`. Never hardcode a family; SVG contexts must set `fontFamily: "var(--font-sans)"` explicitly.
- Page title: `text-2xl font-semibold tracking-tight md:text-[1.75rem]`
- Card title: `text-sm font-semibold`; supporting: `text-xs text-muted-foreground`
- Numbers: always `tabular-nums`

## Iconography

Lucide only. Stroke scale (three steps, nothing else):

| strokeWidth | Use |
|---|---|
| `1.5` | Decorative / large icons (empty states, tiles) |
| `1.75` | Interactive / toolbar / nav icons (default) |
| `2` | Emphasis: confirm, check, plus on primary CTAs |

## Spacing & Layout

- Page rhythm: `gap-5 md:gap-6` between sections
- Card padding: `p-5` (dense widgets `p-4`)
- PageContainer sizes: default `max-w-6xl`, wide `max-w-7xl`
- RTL: always logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`). Physical shadows need `[dir="rtl"]` overrides (see `.glass-sidebar`).

## Interaction

- Touch targets: minimum `size-10` (40px) for mobile-first flows; never below.
- Focus: every custom interactive element gets `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`.
- Motion: ease `[0.22, 1, 0.36, 1]` (`easePremium`), durations 0.25–0.4s. Hover lift `y: -4`, tap `scale: 0.98`. All framer animation respects reduced motion via `MotionConfig reducedMotion="user"` in AppProviders.
- Empty states: use `components/ui/empty-state.tsx` — never inline a bespoke one.
- Skeletons: use `components/ui/page-skeleton.tsx` variants; shimmer via `.shimmer`.

## Surfaces

- `glass-card` — cards; `glass-bar` — topbar; `glass-sidebar` — sidebar.
- Status hover glows: `status-glow-{status}` classes.
