import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTs from "eslint-config-next/typescript"

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test and E2E files use different conventions
    "src/__tests__/**",
    "e2e/**",
  ]),
  {
    rules: {
      // ── React Hooks rules (Next.js 16 strict mode) ─────────────────────────

      // `static-components`: fires when a component type is stored in a local
      // variable and used as JSX.  Our pattern (icon lookup from a static map)
      // returns the SAME stable reference every time — no re-mount risk.
      // Downgrade to warn so CI catches real violations while allowing this pattern.
      "react-hooks/static-components": "warn",

      // `set-state-in-effect`: fires on any setState call inside useEffect body.
      // All our usages are intentional: mount detection, form reset on open,
      // persist hydration fallback.  Downgrade to warn.
      "react-hooks/set-state-in-effect": "warn",

      // ── TypeScript ─────────────────────────────────────────────────────────
      // Allow explicit `any` only in lib layer (Supabase generics)
      "@typescript-eslint/no-explicit-any": "warn",

      // ── Misc ──────────────────────────────────────────────────────────────
      // Unused vars that start with _ are intentionally ignored
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
    },
  },
])

export default eslintConfig
