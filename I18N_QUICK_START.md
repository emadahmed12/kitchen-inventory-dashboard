# i18n Quick Start Guide

## Running the Dev Server

```bash
cd ~/Desktop/kitchen-inventory-dashboard
npm run dev -- --experimental-https
```

**Access the app:**
- 🇸🇦 Arabic: https://localhost:3000 (RTL, Cairo font)
- 🇬🇧 English: https://localhost:3000/en (LTR, Inter font)
- 📱 Mobile: https://192.168.100.171:3000 (replace IP with your machine's network IP)

---

## Testing the Implementation

### 1. Verify Locale Detection
- Open https://localhost:3000 → Should load in Arabic (RTL)
- Open https://localhost:3000/en → Should load in English (LTR)

### 2. Test Language Switcher
- Click the language dropdown in the top-right corner
- Switch from Arabic to English or vice versa
- Verify smooth animation and instant RTL/LTR toggle

### 3. Check Mobile Responsiveness
- Resize browser to mobile view (375x812)
- Test language switcher on mobile
- Verify all text displays correctly in both languages

### 4. Verify All Pages
Test these routes in both locales:
- `/` and `/en` (Dashboard)
- `/inventory` and `/en/inventory`
- `/shopping` and `/en/shopping`
- `/analytics` and `/en/analytics`
- `/storage` and `/en/storage`
- `/settings` and `/en/settings`

### 5. Browser DevTools Checks
**Network Tab:**
- Verify fonts load: `cairo` (Arabic) and `inter` (English)
- Check cookie: `NEXT_LOCALE=ar` or `NEXT_LOCALE=en`

**Elements Tab:**
- Arabic: `<html lang="ar" dir="rtl" class="cairo_...variable">`
- English: `<html lang="en" dir="ltr" class="inter_...variable">`

**Console:**
- Should be clean (no errors or warnings)

---

## Adding a New Language

### Example: Adding French (fr)

**Step 1:** Update routing
```typescript
// src/i18n/routing.ts
export const defaultLocale = 'ar';
export const locales = ['ar', 'en', 'fr'];  // ← Add 'fr'
```

**Step 2:** Create message file
```json
// src/messages/fr.json
{
  "nav": {
    "dashboard": "Tableau de bord",
    "inventory": "Inventaire",
    ...
  },
  "topbar": {
    "searchPlaceholder": "Rechercher l'inventaire ou les commandes...",
    ...
  },
  ...
}
```

**Step 3:** Update fonts (if needed)
```typescript
// src/app/[locale]/layout.tsx
import { Cairo, Inter, Poppins } from "next/font/google";

const cairo = Cairo({ subsets: ["arabic"] });
const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ weight: ["400", "500", "600"], subsets: ["latin"] });

const fontMap = {
  ar: cairo,
  en: inter,
  fr: poppins,  // ← Add font mapping
};
```

**Step 4:** Restart dev server
```bash
npm run dev -- --experimental-https
```

**Step 5:** Test
```
https://localhost:3000/fr
```

---

## File Structure

```
src/
├── i18n/
│   ├── routing.ts          ← Locale configuration
│   ├── request.ts          ← Server-side message loading
│   └── navigation.ts       ← Locale-aware navigation
├── proxy.ts                ← Middleware for routing
├── messages/
│   ├── ar.json            ← Arabic translations (200+)
│   └── en.json            ← English translations (200+)
├── app/
│   ├── layout.tsx         ← Root layout (minimal)
│   └── [locale]/
│       ├── layout.tsx     ← Main layout with fonts & metadata
│       ├── page.tsx       ← Dashboard
│       ├── inventory/page.tsx
│       ├── shopping/page.tsx
│       ├── analytics/page.tsx
│       ├── storage/page.tsx
│       └── settings/page.tsx
└── components/
    ├── layout/
    │   ├── language-switcher.tsx  ← Language selector
    │   ├── topbar.tsx             ← Updated with i18n
    │   ├── sidebar.tsx            ← Updated with i18n
    │   └── nav-config.ts
    ├── dashboard/                  ← All updated with translations
    ├── inventory/                  ← All updated with translations
    ├── command/
    │   └── command-palette.tsx    ← Updated with i18n
    └── pwa/
        └── install-prompt.tsx     ← Updated with i18n
```

---

## Translation Namespaces

Messages are organized in namespaces for easy management:

```json
{
  "nav": { ... },           // Navigation menu items
  "topbar": { ... },        // Top bar strings
  "sidebar": { ... },       // Sidebar strings
  "dashboard": { ... },     // Dashboard page
  "alerts": { ... },        // Alert messages
  "activity": { ... },      // Activity feed
  "inventory": { ... },     // Inventory page
  "form": { ... },          // Form labels
  "deleteDialog": { ... },  // Delete confirmations
  "toast": { ... },         // Toast notifications
  "status": { ... },        // Item status labels
  "sort": { ... },          // Sort options
  "catalog": { ... },       // Units, categories, locations
  "command": { ... },       // Command palette
  "pwa": { ... },           // PWA install prompt
  "pages": { ... },         // Page-specific strings
  "insights": { ... },      // Dashboard insights
  "meta": { ... }           // Page metadata
}
```

---

## Troubleshooting

### Language switcher not working?
1. Clear browser cookies
2. Check browser console for errors
3. Restart dev server

### Fonts not switching?
1. Clear `.next` build cache: `rm -rf .next`
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

### Translations not updating?
1. Verify message file has correct namespace
2. Check component is using correct `useTranslations()` namespace
3. Restart dev server to reload messages

### Hydration errors?
1. Verify `NextIntlClientProvider` wraps client components
2. Check locale parameter in `getTranslations()`
3. Ensure async components don't use `useTranslations()`

---

## Key Features

✅ **Automatic locale detection** via middleware  
✅ **Persistent locale selection** via cookie  
✅ **Per-locale fonts** (Cairo for Arabic, Inter for English)  
✅ **Dynamic RTL/LTR** switching  
✅ **Locale-aware metadata** for SEO  
✅ **200+ translated strings** across all components  
✅ **Mobile-responsive** design  
✅ **PWA compatible**  
✅ **Future-ready** (easy to add more languages)  

---

## Performance Notes

- Fonts are preloaded to avoid layout shift
- Messages are lazy-loaded per locale (no bundle bloat)
- Language switching is non-blocking (uses `useTransition()`)
- Cookies ensure instant locale on subsequent visits
- Static site generation ready for both locales

---

## Support for More Languages

The system is designed to support unlimited languages:

1. **Add locale to routing.ts:**
   ```typescript
   export const locales = ['ar', 'en', 'fr', 'de', 'es'];
   ```

2. **Add message file** for each locale:
   ```
   src/messages/de.json
   src/messages/es.json
   ```

3. **Add font mapping** (if needed):
   ```typescript
   const fontMap = {
     ar: cairo,
     en: inter,
     fr: poppins,
     de: inter,
     es: inter,
   };
   ```

4. **Restart and test** — no other changes needed!

The architecture automatically handles:
- Routing
- Font loading
- Metadata generation
- Message loading
- Cookie persistence

---

## Questions?

Refer to:
- `I18N_VERIFICATION_REPORT.md` - Full verification details
- `src/i18n/routing.ts` - Locale configuration
- `src/messages/ar.json` or `en.json` - Translation reference
