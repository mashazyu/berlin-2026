import localFont from "next/font/local"

/**
 * Self-hosted via next/font/local so production builds never call Google Fonts.
 * Avoids vercel/next.js#99114 (extensionless /l/font?kit= URLs crash next/font/google).
 */
export const lora = localFont({
  src: [
    { path: "../fonts/lora-cyrillic.woff2", weight: "400 700", style: "normal" },
    { path: "../fonts/lora-latin-ext.woff2", weight: "400 700", style: "normal" },
    { path: "../fonts/lora-latin.woff2", weight: "400 700", style: "normal" },
  ],
  variable: "--font-lora",
  display: "swap",
})

export const dmSans = localFont({
  src: [
    { path: "../fonts/dm-sans-latin-ext.woff2", weight: "100 1000", style: "normal" },
    { path: "../fonts/dm-sans-latin.woff2", weight: "100 1000", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
})

export const notoSansArabic = localFont({
  src: [{ path: "../fonts/noto-sans-arabic.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-noto-sans-arabic",
  display: "swap",
})

export const sourceSans3 = localFont({
  src: [
    {
      path: "../fonts/source-sans-3-cyrillic.woff2",
      weight: "200 900",
      style: "normal",
    },
    {
      path: "../fonts/source-sans-3-latin-ext.woff2",
      weight: "200 900",
      style: "normal",
    },
    { path: "../fonts/source-sans-3-latin.woff2", weight: "200 900", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
})
