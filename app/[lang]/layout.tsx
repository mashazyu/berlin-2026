import type React from "react"
import { Lora, DM_Sans } from "next/font/google"
import { notFound } from "next/navigation"
import { LanguageProvider } from "@/components/language-provider"
import {
  SUPPORTED_LANGUAGES,
  type Language,
} from "@/lib/i18n/get-translations"
import { CONTENT_LANGUAGE } from "@/lib/seo/constants"

const lora = Lora({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-lora",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
})

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }))
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!(SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
    notFound()
  }
  const language = lang as Language

  return (
    <html lang={CONTENT_LANGUAGE[language]} suppressHydrationWarning>
      <body
        className={`${lora.variable} ${dmSans.variable} font-sans antialiased`}
      >
        <LanguageProvider initialLanguage={language}>{children}</LanguageProvider>
      </body>
    </html>
  )
}
