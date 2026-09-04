import { readFile } from "node:fs/promises"
import path from "node:path"

/** Local subsetted Noto Sans (Latin + Cyrillic) for `next/og` — no network at build time. */

const FONT_DIR = path.join(process.cwd(), "assets", "fonts")

let fontsPromise: Promise<
  {
    name: string
    data: ArrayBuffer
    style: "normal"
    weight: 400 | 700
  }[]
> | null = null

async function loadLocalFonts() {
  const [regularBuf, boldBuf] = await Promise.all([
    readFile(path.join(FONT_DIR, "NotoSans-400.ttf")),
    readFile(path.join(FONT_DIR, "NotoSans-700.ttf")),
  ])

  return [
    {
      name: "Noto Sans",
      data: Uint8Array.from(regularBuf).buffer,
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Noto Sans",
      data: Uint8Array.from(boldBuf).buffer,
      style: "normal" as const,
      weight: 700 as const,
    },
  ]
}

export async function getOgFonts(_text?: string) {
  fontsPromise ??= loadLocalFonts()
  return fontsPromise
}
