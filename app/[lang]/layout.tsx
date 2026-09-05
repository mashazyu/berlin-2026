import type React from "react"
import { Lora, Source_Sans_3 } from "next/font/google"
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

/** Source Sans 3 (not DM Sans): DM Sans has no Cyrillic glyphs → RU body fell back to Arial. */
const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  variable: "--font-source-sans",
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
        className={`${lora.variable} ${sourceSans.variable} font-sans antialiased`}
      >
        <LanguageProvider initialLanguage={language}>{children}</LanguageProvider>
      </body>
    </html>
  )
}
