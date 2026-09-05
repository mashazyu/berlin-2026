/**
 * Refresh local Noto Sans files used by next/og and next/font/local.
 *
 *   pnpm regen:og-fonts
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const OUT_DIR = path.join(ROOT, "assets", "fonts")

const FILES = [
  {
    url: "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/unhinted/ttf/NotoSans-Regular.ttf",
    out: "NotoSans-400.ttf",
  },
  {
    url: "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/unhinted/ttf/NotoSans-Medium.ttf",
    out: "NotoSans-500.ttf",
  },
  {
    url: "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/unhinted/ttf/NotoSans-SemiBold.ttf",
    out: "NotoSans-600.ttf",
  },
  {
    url: "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/unhinted/ttf/NotoSans-Bold.ttf",
    out: "NotoSans-700.ttf",
  },
]

fs.mkdirSync(OUT_DIR, { recursive: true })

for (const file of FILES) {
  const res = await fetch(file.url)
  if (!res.ok) throw new Error(`Failed ${file.url}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const dest = path.join(OUT_DIR, file.out)
  fs.writeFileSync(dest, buf)
  console.log("wrote", path.relative(ROOT, dest), buf.length)
}
