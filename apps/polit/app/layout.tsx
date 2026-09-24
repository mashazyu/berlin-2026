import { DM_Sans, Lora } from "next/font/google"
import type { Metadata } from "next"
import "./theme.css"

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
})

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-lora",
})

export const metadata: Metadata = {
  title: "Site C",
  description: "Monorepo demo site with teal CTAs",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  )
}
