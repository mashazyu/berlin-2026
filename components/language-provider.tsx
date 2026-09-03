"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { getTranslations, type Language, type Translations } from "@/lib/i18n/get-translations"
import { LANGUAGE_COOKIE } from "@/lib/seo/negotiate-language"

type LanguageContextValue = {
  language: Language
  translations: Translations
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language
  children: ReactNode
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    document.cookie = `${LANGUAGE_COOKIE}=${lang};path=/;max-age=31536000;samesite=lax`
  }, [])

  const value = useMemo(
    () => ({
      language,
      translations: getTranslations(language),
      setLanguage,
    }),
    [language, setLanguage]
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
