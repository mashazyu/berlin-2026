import en from "../locales/en.json"
import de from "../locales/de.json"

export const LANGUAGES = ["en", "de"] as const
export type Language = (typeof LANGUAGES)[number]
export type Translations = typeof en

const catalogs: Record<Language, Translations> = { en, de }

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value)
}

export function toSafeLanguage(value: string | undefined): Language {
  return value && isLanguage(value) ? value : "en"
}

export function getTranslations(language: Language): Translations {
  return catalogs[language]
}
