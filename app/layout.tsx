import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.berlin-2026.de"),
  title: {
    default: "Berlin 2026",
    template: "%s",
  },
  verification: {
    other: {
      "msvalidate.01": "4DBD54B1791F00A8281324ADFFC4C59A",
    },
  },
}

/** Passthrough so `[lang]/layout` owns `<html lang>` for correct SEO/a11y. */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
