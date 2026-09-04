/** Fonts for `next/og` ImageResponse — must include Latin + Cyrillic. */

const NOTO_SANS_REGULAR =
  "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/full/ttf/NotoSans-Regular.ttf"
const NOTO_SANS_BOLD =
  "https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoSans/full/ttf/NotoSans-Bold.ttf"

let regularPromise: Promise<ArrayBuffer> | null = null
let boldPromise: Promise<ArrayBuffer> | null = null

async function loadFont(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to load OG font: ${url} (${res.status})`)
  }
  return res.arrayBuffer()
}

export async function getOgFonts() {
  regularPromise ??= loadFont(NOTO_SANS_REGULAR)
  boldPromise ??= loadFont(NOTO_SANS_BOLD)
  const [regular, bold] = await Promise.all([regularPromise, boldPromise])

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
