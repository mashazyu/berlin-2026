/** Subsetted TTFs for `next/og` (Latin + Cyrillic / Arabic as needed).
 *  Fetches a Google `text=` subset for the exact OG copy.
 *  Falls back to local assets/fonts if the network fetch fails (e.g. offline build).
 *
 *  Arabic uses Cairo (not Noto Sans Arabic): Satori crashes on Noto’s GSUB
 *  `lookupType: 5 - substFormat: 3` during Arabic shaping. */

import { readFile } from "node:fs/promises"
import path from "node:path"

const GOOGLE_CSS_NOTO_SANS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap&text="
const GOOGLE_CSS_CAIRO =
  "https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap&text="

/** Old Safari UA → Google returns `truetype` instead of woff2. */
const FONT_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"

const FONT_DIR = path.join(process.cwd(), "assets", "fonts")

function uniqueChars(text: string): string {
  return [...new Set(text.replace(/\s+/g, " "))].join("")
}

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer
}

function hasArabic(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text)
}

async function loadWeightFromGoogle(
  chars: string,
  weight: 400 | 700,
  cssBase: string,
  familyLabel: string
): Promise<ArrayBuffer> {
  const cssUrl = `${cssBase}${encodeURIComponent(chars)}`
  const css = await fetch(cssUrl, {
    headers: { "User-Agent": FONT_UA },
  }).then((res) => {
    if (!res.ok) throw new Error(`OG font CSS failed: ${res.status}`)
    return res.text()
  })

  const block = css
    .split("@font-face")
    .find((part) => part.includes(`font-weight: ${weight}`))

  const match = block?.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/)
  if (!match?.[1]) {
    throw new Error(`No truetype URL for ${familyLabel} weight ${weight}`)
  }

  const fontRes = await fetch(match[1])
  if (!fontRes.ok) throw new Error(`OG font download failed: ${fontRes.status}`)
  return fontRes.arrayBuffer()
}

async function loadWeightFromLocal(
  weight: 400 | 700,
  arabic: boolean
): Promise<ArrayBuffer> {
  const file = arabic ? `Cairo-${weight}.ttf` : `NotoSans-${weight}.ttf`
  const buf = await readFile(path.join(FONT_DIR, file))
  return toArrayBuffer(buf)
}

async function loadWeight(
  chars: string,
  weight: 400 | 700,
  arabic: boolean
): Promise<ArrayBuffer> {
  const cssBase = arabic ? GOOGLE_CSS_CAIRO : GOOGLE_CSS_NOTO_SANS
  const familyLabel = arabic ? "Cairo" : "Noto Sans"
  try {
    return await loadWeightFromGoogle(chars, weight, cssBase, familyLabel)
  } catch (err) {
    console.warn(
      `[og-fonts] Google fetch failed for ${familyLabel} ${weight}, using local fallback:`,
      err
    )
    return loadWeightFromLocal(weight, arabic)
  }
}

export async function getOgFonts(text: string) {
  const chars = uniqueChars(`Berlin2026· ${text}`)
  const arabic = hasArabic(text)
  const familyName = arabic ? "Cairo" : "Noto Sans"
  const [regular, bold] = await Promise.all([
    loadWeight(chars, 400, arabic),
    loadWeight(chars, 700, arabic),
  ])

  return [
    {
      name: familyName,
      data: regular,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: familyName,
      data: bold,
      style: "normal" as const,
      weight: 700 as const,
    },
  ]
}
