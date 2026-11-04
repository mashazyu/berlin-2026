import { lora, sourceSans3 } from "@kompass/fonts"
import type { Metadata } from "next"
import "./theme.css"

export const metadata: Metadata = {
  title: "Wasser-Kompass",
  description:
    "Free drinking water map for Berlin — fountains, Refill points and dispensers.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      className={`${sourceSans3.variable} ${lora.variable}`}
    >
      <body>{children}</body>
    </html>
  )
}
