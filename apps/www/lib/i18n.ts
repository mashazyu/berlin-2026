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
  const base = catalogs[language]
  // Impressum / privacy are authored in DE + EN only; other locales use DE copy.
  if (language === "en" || language === "de") return base
  return {
    ...base,
    privacy: catalogs.de.privacy,
    impressum: catalogs.de.impressum,
  }
}

/** Impressum / privacy are maintained in DE + EN; RU falls back to DE. */
export function legalLanguageFor(lang: Language): "de" | "en" {
  return lang === "en" ? "en" : "de"
}

export function withContactEmail(text: string, email: string): string {
  return text.replaceAll("{email}", email)
}
