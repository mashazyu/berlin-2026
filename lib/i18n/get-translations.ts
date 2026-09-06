import en from "../../locales/en.json"
import de from "../../locales/de.json"
import ru from "../../locales/ru.json"
import tr from "../../locales/tr.json"
import { deepMergeWithFallback } from "./fallback"
import type { Language, Translations } from "./types"

export type { Language, Translations }

export const SUPPORTED_LANGUAGES = ["en", "de", "tr", "ru"] as const satisfies readonly Language[]

export const languages: Record<Language, Translations> = {
  en: en as Translations,
  de: deepMergeWithFallback(en as Translations, de as Partial<Translations>),
  ru: deepMergeWithFallback(en as Translations, ru as Partial<Translations>),
  tr: deepMergeWithFallback(en as Translations, tr as Partial<Translations>),
}

export function getTranslations(lang: Language): Translations {
  return languages[lang] ?? languages.en
}

export function isLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}
