import localFont from "next/font/local"

/**
 * Shared self-hosted fonts for all Kompass apps.
 * Avoids next/font/google (vercel/next.js#99114) and keeps one copy of each file.
 */

export const lora = localFont({
  src: [
    { path: "../files/lora-cyrillic.woff2", weight: "400 700", style: "normal" },
    { path: "../files/lora-latin-ext.woff2", weight: "400 700", style: "normal" },
    { path: "../files/lora-latin.woff2", weight: "400 700", style: "normal" },
  ],
  variable: "--font-lora",
  display: "swap",
})

export const dmSans = localFont({
  src: [
    {
      path: "../files/dm-sans-latin-ext.woff2",
      weight: "100 1000",
      style: "normal",
    },
    { path: "../files/dm-sans-latin.woff2", weight: "100 1000", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
})

export const sourceSans3 = localFont({
  src: [
    {
      path: "../files/source-sans-3-cyrillic.woff2",
      weight: "200 900",
      style: "normal",
    },
    {
      path: "../files/source-sans-3-latin-ext.woff2",
      weight: "200 900",
      style: "normal",
    },
    {
      path: "../files/source-sans-3-latin.woff2",
      weight: "200 900",
      style: "normal",
    },
  ],
  /** Same CSS var as dmSans so existing --font-sans tokens keep working. */
  variable: "--font-dm-sans",
  display: "swap",
})

export const notoSansArabic = localFont({
  src: [
    { path: "../files/noto-sans-arabic.woff2", weight: "100 900", style: "normal" },
  ],
  variable: "--font-noto-sans-arabic",
  display: "swap",
})
