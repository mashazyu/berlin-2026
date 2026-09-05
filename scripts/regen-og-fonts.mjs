/**
 * Regenerate local Noto Sans subsets for next/og (Latin + Cyrillic + DE).
 * Run after changing OG-visible copy if tofu appears: `node scripts/regen-og-fonts.mjs`
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "assets", "fonts")

const FONT_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"

const CYR =
  "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя"
const LAT = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
const DE = "ÄÖÜäöüß"
const EXTRA = "0123456789 ·—–-.,;:!?\'’“”()[]/&%+@№«»"

function collectChars() {
  const chunks = [CYR, LAT, DE, EXTRA]
  for (const lang of ["en", "de", "ru"]) {
    const t = JSON.parse(
      fs.readFileSync(path.join(ROOT, "locales", `${lang}.json`), "utf8")
    )
    chunks.push(
      t.brand?.name ?? "",
      t.hero?.headline ?? "",
      t.hero?.support ?? "",
      t.hero?.blurb ?? "",
      t.metadata?.homeTitle ?? "",
      t.comparison?.title ?? "",
      t.about?.title ?? "",
      t.motivation?.title ?? ""
    )
  }
  return [...new Set(chunks.join(" "))].join("")
}

async function loadWeight(weight, chars) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans:wght@${weight}&display=swap&text=${encodeURIComponent(chars)}`
  const css = await fetch(cssUrl, { headers: { "User-Agent": FONT_UA } }).then(
    (r) => r.text()
  )
  const block = css.split("@font-face").find((p) => p.includes(`font-weight: ${weight}`))
  const match = block?.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/)
  if (!match) throw new Error(`No TTF for weight ${weight}:\n${css.slice(0, 400)}`)
  const buf = Buffer.from(await fetch(match[1]).then((r) => r.arrayBuffer()))
  const out = path.join(OUT_DIR, `NotoSans-${weight}.ttf`)
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(out, buf)
  console.log("wrote", path.relative(ROOT, out), buf.length)
}

const chars = collectChars()
console.log("unique chars", chars.length)
await loadWeight(400, chars)
await loadWeight(700, chars)
