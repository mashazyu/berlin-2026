import type { Language } from "@/lib/i18n/types"
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/seo/constants"

export const LANGUAGE_COOKIE = "b2026_lang"

/**
 * Pick the best supported language from the browser Accept-Language header.
 * Unsupported languages fall back to English.
 */
export function negotiateLanguage(acceptLanguage: string | null): Language {
  if (!acceptLanguage) return DEFAULT_LANGUAGE

  const parsed: { tag: string; primary: string; q: number }[] = []

  for (const part of acceptLanguage.split(",")) {
    const [rawTag, ...params] = part.trim().split(";")
    if (!rawTag) continue
    const tag = rawTag.trim().toLowerCase()
    const qParam = params.find((p) => p.trim().startsWith("q="))
    const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1
    if (Number.isNaN(q) || q <= 0) continue
    parsed.push({
      tag,
      primary: tag.split("-")[0] ?? tag,
      q,
    })
  }

  parsed.sort((a, b) => b.q - a.q)

  // Prefer exact matches (e.g. en-US) then primary (e.g. de from de-DE)
  for (const { tag, primary } of parsed) {
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(tag)) {
      return tag as Language
    }
    if ((SUPPORTED_LANGUAGES as readonly string[]).includes(primary)) {
      return primary as Language
    }
  }

  return DEFAULT_LANGUAGE
}

export function languageFromCookie(value: string | undefined): Language | null {
  if (value && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)) {
    return value as Language
  }
  return null
}

/**
 * Cookie (explicit user choice) wins; otherwise browser language; else English.
 */
export function resolveRequestLanguage(opts: {
  cookieValue?: string
  acceptLanguage: string | null
}): Language {
  return (
    languageFromCookie(opts.cookieValue) ??
    negotiateLanguage(opts.acceptLanguage)
  )
}
