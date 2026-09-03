import type React from "react"
import { notFound } from "next/navigation"
import { LanguageProvider } from "@/components/language-provider"
import {
  SUPPORTED_LANGUAGES,
  type Language,
} from "@/lib/i18n/get-translations"
import { CONTENT_LANGUAGE } from "@/lib/seo/constants"

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
    <LanguageProvider initialLanguage={language}>
      <div lang={CONTENT_LANGUAGE[language]}>{children}</div>
    </LanguageProvider>
  )
}
