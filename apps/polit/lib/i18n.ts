import en from "../locales/en.json"
import de from "../locales/de.json"
import uk from "../locales/uk.json"

export const LANGUAGES = ["en", "de", "uk"] as const
export type Language = (typeof LANGUAGES)[number]
export type Translations = typeof en

const catalogs: Record<Language, Translations> = { en, de, uk }

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value)
}

export function toSafeLanguage(value: string | undefined): Language {
  return value && isLanguage(value) ? value : "en"
}

export function getTranslations(language: Language): Translations {
  return catalogs[language]
}
