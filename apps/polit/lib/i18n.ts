import en from "../locales/en.json"
import de from "../locales/de.json"
import ru from "../locales/ru.json"

export const LANGUAGES = ["de", "en", "ru"] as const
export type Language = (typeof LANGUAGES)[number]
export type Translations = typeof de

const catalogs: Record<Language, Translations> = { de, en, ru }

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value)
}

export function toSafeLanguage(value: string | undefined): Language {
  return value && isLanguage(value) ? value : "de"
}

export function getTranslations(language: Language): Translations {
  return catalogs[language]
}
