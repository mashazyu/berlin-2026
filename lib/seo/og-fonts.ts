import { readFile } from "node:fs/promises"
import path from "node:path"

/** Local full Noto Sans (Latin + Cyrillic) for `next/og` — no network at build.
 *  Refresh with `pnpm regen:og-fonts`. */

const FONT_DIR = path.join(process.cwd(), "assets", "fonts")

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer
}

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
      data: toArrayBuffer(regularBuf),
      style: "normal" as const,
      weight: 400 as const,
    },
    {
      name: "Noto Sans",
      data: toArrayBuffer(boldBuf),
      style: "normal" as const,
      weight: 700 as const,
    },
  ]
}

export async function getOgFonts(_text?: string) {
  fontsPromise ??= loadLocalFonts()
  return fontsPromise
}
