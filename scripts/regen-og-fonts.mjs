/**
 * Refresh local OG font fallbacks (Google text= subsets for current hero copy).
 * Runtime prefers a fresh Google fetch; these files are offline fallback only.
 *
 *   pnpm regen:og-fonts
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "assets", "fonts")

const FONT_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"

function collectChars(arabic = false) {
  const chunks = ["Berlin2026·"]
  const langs = arabic
    ? ["ar"]
    : ["en", "de", "tr", "uk", "pl", "ru", "es", "ku", "vi", "it"]
  for (const lang of langs) {
    const t = JSON.parse(
      fs.readFileSync(path.join(ROOT, "locales", `${lang}.json`), "utf8")
    )
    chunks.push(
      t.hero?.headline ?? "",
      t.hero?.support ?? "",
      t.metadata?.homeTitle ?? "",
      t.brand?.tagline ?? ""
    )
  }
  return [...new Set(chunks.join(" ").replace(/\s+/g, " "))].join("")
}

async function loadWeight(weight, chars, family) {
  // Arabic: Cairo — Noto Sans Arabic crashes Satori (GSUB substFormat 3).
  const familyParam =
    family === "arabic"
      ? `Cairo:wght@${weight}`
      : `Noto+Sans:wght@${weight}`
  const cssUrl = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap&text=${encodeURIComponent(chars)}`
  const css = await fetch(cssUrl, { headers: { "User-Agent": FONT_UA } }).then(
    (r) => r.text()
  )
  const block = css.split("@font-face").find((p) => p.includes(`font-weight: ${weight}`))
  const match = block?.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/)
  if (!match) throw new Error(`No TTF for ${family} ${weight}:\n${css.slice(0, 400)}`)
  const buf = Buffer.from(await fetch(match[1]).then((r) => r.arrayBuffer()))
  const filename =
    family === "arabic" ? `Cairo-${weight}.ttf` : `NotoSans-${weight}.ttf`
  const out = path.join(OUT_DIR, filename)
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(out, buf)
  console.log("wrote", path.relative(ROOT, out), buf.length)
}

const latinChars = collectChars(false)
console.log("unique latin/cyrillic chars", latinChars.length)
await loadWeight(400, latinChars, "latin")
await loadWeight(700, latinChars, "latin")

const arabicChars = collectChars(true)
console.log("unique arabic chars", arabicChars.length)
await loadWeight(400, arabicChars, "arabic")
await loadWeight(700, arabicChars, "arabic")
