import type React from "react"
import localFont from "next/font/local"
import { notFound } from "next/navigation"
import { LanguageProvider } from "@/components/language-provider"
import {
  SUPPORTED_LANGUAGES,
  type Language,
} from "@/lib/i18n/get-translations"
import { CONTENT_LANGUAGE } from "@/lib/seo/constants"

/** Local Noto Sans (Latin + Cyrillic). Google webfonts were inconsistent for RU. */
const notoSans = localFont({
  src: [
    {
      path: "../../assets/fonts/NotoSans-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../assets/fonts/NotoSans-500.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../assets/fonts/NotoSans-600.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../assets/fonts/NotoSans-700.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-noto-sans",
  display: "swap",
  adjustFontFallback: false,
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
      <body className={`${notoSans.variable} font-sans antialiased`}>
        <LanguageProvider initialLanguage={language}>{children}</LanguageProvider>
      </body>
    </html>
  )
}
