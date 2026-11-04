import { lora, sourceSans3 } from "@kompass/fonts"
import type { Metadata } from "next"
import "./theme.css"

export const metadata: Metadata = {
  title: "Kompass Kollektive",
  description:
    "Nina and Masha build civic tools for Berlin: Wasser-Kompass, Wahl-Kompass and Kommunal-Kompass.",
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
