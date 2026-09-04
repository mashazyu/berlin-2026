import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.berlin-2026.de"),
  title: {
    default: "Berlin 2026",
    template: "%s",
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
