import { Lora, Source_Sans_3 } from "next/font/google"
import type { Metadata } from "next"
import "./theme.css"

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-dm-sans",
})

const lora = Lora({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-lora",
})

export const metadata: Metadata = {
  title: "Polit",
  description:
    "Tools for Berliners to communicate with local authorities about communal issues.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${sourceSans.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  )
}
