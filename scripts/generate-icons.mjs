/**
 * Generates PWA icons from an SVG source using sharp (bundled with Next.js).
 * Run once: node scripts/generate-icons.mjs
 */
import { createRequire } from "module"
import { mkdirSync, writeFileSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const sharp = require(path.resolve(__dirname, "../node_modules/sharp"))

const SVG = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#1e1c30"/>
      <stop offset="50%" stop-color="#2a2744"/>
      <stop offset="100%" stop-color="#1c2438"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6655cc" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#6655cc" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" fill="url(#bg)"/>
  <!-- Subtle radial glow -->
  <ellipse cx="256" cy="256" rx="200" ry="200" fill="url(#glow)"/>

  <!-- Lid knob -->
  <rect x="228" y="178" width="56" height="24" rx="12" fill="rgba(255,255,255,0.88)"/>
  <!-- Lid bar -->
  <rect x="168" y="202" width="176" height="10" rx="5" fill="rgba(255,255,255,0.88)"/>

  <!-- Pot body -->
  <rect x="154" y="214" width="204" height="148" rx="28" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.78)" stroke-width="8"/>

  <!-- Left handle -->
  <rect x="114" y="232" width="36" height="56" rx="16" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="8"/>
  <!-- Right handle -->
  <rect x="362" y="232" width="36" height="56" rx="16" fill="none" stroke="rgba(255,255,255,0.78)" stroke-width="8"/>

  <!-- Inventory dots row -->
  <circle cx="210" cy="298" r="18" fill="#f0b040"/>
  <circle cx="256" cy="298" r="18" fill="#60b0f4"/>
  <circle cx="302" cy="298" r="18" fill="#72dda0"/>
</svg>`

async function run() {
  const outDir = path.resolve(__dirname, "../public/icons")
  mkdirSync(outDir, { recursive: true })

  const svgBuf = Buffer.from(SVG)

  const sizes = [
    { name: "icon-192.png", size: 192 },
    { name: "icon-512.png", size: 512 },
    { name: "apple-touch-icon.png", size: 180 },
    { name: "icon-96.png", size: 96 },
  ]

  for (const { name, size } of sizes) {
    await sharp(svgBuf)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, name))
    console.log(`✓ ${name}`)
  }

  // Also write the SVG source for reference
  writeFileSync(path.join(outDir, "icon.svg"), SVG)
  console.log("✓ icon.svg")
  console.log("\nAll icons generated in public/icons/")
}

run().catch((err) => {
  console.error("Icon generation failed:", err)
  process.exit(1)
})
