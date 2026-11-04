"use client"

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import {
  getTranslations,
  type Language,
  type Translations,
} from "@/lib/i18n"

type LanguageContextValue = {
  language: Language
  translations: Translations
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  language,
  children,
}: {
  language: Language
  children: ReactNode
}) {
  const value = useMemo(
    () => ({ language, translations: getTranslations(language) }),
    [language]
  )
  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
