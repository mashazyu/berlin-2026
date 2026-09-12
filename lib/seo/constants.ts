import type { Language } from "@/lib/i18n/types"

export const BASE_URL = "https://www.berlin-2026.de"

/** Sole public contact / feedback inbox (reports, mailto, privacy). */
export const CONTACT_EMAIL = "feedback@berlin-2026.de"

/** Resend “from” address using the same inbox. */
export const CONTACT_FROM = `Berlin 2026 <${CONTACT_EMAIL}>`

/**
 * Display / iteration order: English first, then Berlin community size
 * (de → tr → ku → pl → ru → uk → ar → es). Single source of truth for switcher, sitemap, etc.
 */
export const SUPPORTED_LANGUAGES = [
  "en",
  "de",
  "tr",
  "ku",
  "pl",
  "ru",
  "uk",
  "ar",
  "es",
] as const satisfies readonly Language[]

export const DEFAULT_LANGUAGE: Language = "de"

export const CONTENT_LANGUAGE: Record<Language, string> = {
  en: "en-DE",
  de: "de-DE",
  tr: "tr-DE",
  ku: "ku-DE",
  uk: "uk-DE",
  pl: "pl-DE",
  ru: "ru-DE",
  ar: "ar-DE",
  es: "es-DE",
}

/** Open Graph / Facebook locale tags */
export const OG_LOCALES: Record<Language, string> = {
  en: "en_US",
  de: "de_DE",
  tr: "tr_TR",
  ku: "ku_TR",
  uk: "uk_UA",
  pl: "pl_PL",
  ru: "ru_RU",
  ar: "ar_AE",
  es: "es_ES",
}
export function toSafeLanguage(lang: string | undefined | null): Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang ?? "")
    ? (lang as Language)
    : DEFAULT_LANGUAGE
}

export function normalizePath(path: string): string {
  if (!path) return ""
  return path.startsWith("/") ? path : `/${path}`
}

export function buildAbsoluteUrl(lang: Language, path: string): string {
  return `${BASE_URL}/${lang}${normalizePath(path)}`
}
