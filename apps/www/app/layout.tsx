import localFont from "next/font/local"
import type { Metadata } from "next"
import "./theme.css"

const sourceSans = localFont({
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

const lora = localFont({
  src: [
    { path: "../fonts/lora-cyrillic.woff2", weight: "400 700", style: "normal" },
    { path: "../fonts/lora-latin-ext.woff2", weight: "400 700", style: "normal" },
    { path: "../fonts/lora-latin.woff2", weight: "400 700", style: "normal" },
  ],
  variable: "--font-lora",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Kompass Kollektive",
  description:
    "Nina and Masha build civic tools for Berlin: Wasser-Kompass, Wahl-Kompass and Kommunal-Kompass.",
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
