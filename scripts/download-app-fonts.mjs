/**
 * Download the Google Fonts woff2 subsets we self-host via next/font/local.
 * Run: node scripts/download-app-fonts.mjs
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, "..", "fonts")
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"

const FAMILIES = [
  {
    slug: "lora",
    css: "https://fonts.googleapis.com/css2?family=Lora:wght@400..700&display=swap",
    subsets: ["cyrillic", "latin-ext", "latin"],
  },
  {
    slug: "dm-sans",
    css: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..1000&display=swap",
    subsets: ["latin-ext", "latin"],
  },
  {
    slug: "noto-sans-arabic",
    css: "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@100..900&display=swap",
    subsets: ["arabic"],
    outfile: "noto-sans-arabic.woff2",
  },
  {
    slug: "source-sans-3",
    css: "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@200..900&display=swap",
    subsets: ["cyrillic", "latin-ext", "latin"],
  },
]

async function downloadFamily({ slug, css: cssUrl, subsets, outfile }) {
  const css = await fetch(cssUrl, { headers: { "User-Agent": UA } }).then((r) =>
    r.text()
  )
  let current = null
  const wanted = new Set(subsets)
  const found = new Set()

  for (const line of css.split("\n")) {
    const subsetMatch = /\/\* (.+?) \*\//.exec(line)
    if (subsetMatch) {
      current = subsetMatch[1]
      continue
    }
    const urlMatch = /src: url\(([^)]+)\)/.exec(line)
    if (!urlMatch || !current || !wanted.has(current) || found.has(current)) {
      continue
    }
    const url = urlMatch[1]
    const buf = Buffer.from(
      await fetch(url, { headers: { "User-Agent": UA } }).then((r) =>
        r.arrayBuffer()
      )
    )
    const name =
      outfile && subsets.length === 1
        ? outfile
        : `${slug}-${current}.woff2`
    const out = path.join(OUT, name)
    fs.writeFileSync(out, buf)
    found.add(current)
    console.log("wrote", path.relative(path.join(__dirname, ".."), out), buf.length)
  }

  const missing = subsets.filter((s) => !found.has(s))
  if (missing.length) {
    throw new Error(`${slug}: missing subsets ${missing.join(", ")}`)
  }
}

fs.mkdirSync(OUT, { recursive: true })
for (const family of FAMILIES) {
  await downloadFamily(family)
}
