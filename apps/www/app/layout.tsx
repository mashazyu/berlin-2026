import { DM_Sans, Lora } from "next/font/google"
import type { Metadata } from "next"
import "./theme.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
})

export const metadata: Metadata = {
  title: "Site B",
  description: "Monorepo demo site with blue CTAs",
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
