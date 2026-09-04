/** Subsetted Noto Sans TTFs for `next/og` (Latin + Cyrillic as needed). */

const GOOGLE_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap&text="

/** Old Safari UA → Google returns `truetype` instead of woff2. */
const FONT_UA =
  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"

function uniqueChars(text: string): string {
  return [...new Set(text.replace(/\s+/g, " "))].join("")
}

async function loadWeight(chars: string, weight: 400 | 700): Promise<ArrayBuffer> {
  const cssUrl = `${GOOGLE_CSS}${encodeURIComponent(chars)}`
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
    throw new Error(`No truetype URL for Noto Sans weight ${weight}`)
  }

  const fontRes = await fetch(match[1])
  if (!fontRes.ok) throw new Error(`OG font download failed: ${fontRes.status}`)
  return fontRes.arrayBuffer()
}

export async function getOgFonts(text: string) {
  const chars = uniqueChars(`Berlin2026· ${text}`)
  const [regular, bold] = await Promise.all([
    loadWeight(chars, 400),
    loadWeight(chars, 700),
  ])

  return [
    {
      name: "Noto Sans",
      data: regular,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Noto Sans",
      data: bold,
      style: "normal" as const,
      weight: 700 as const,
    },
  ]
}
