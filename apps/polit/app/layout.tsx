import { lora, sourceSans3 } from "@kompass/fonts"
import type { Metadata } from "next"
import "./theme.css"

export const metadata: Metadata = {
  title: "Kommunal-Kompass",
  description:
    "Tools for Berliners to communicate with local authorities about communal issues.",
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
