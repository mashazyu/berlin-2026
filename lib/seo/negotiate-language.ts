import type { Language } from "@/lib/i18n/types"
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/seo/constants"

export const LANGUAGE_COOKIE = "b2026_lang"

export function negotiateLanguage(acceptLanguage: string | null): Language {
  if (!acceptLanguage) return DEFAULT_LANGUAGE

  const parsed: { primary: string; q: number }[] = []

  for (const part of acceptLanguage.split(",")) {
    const [tag, ...params] = part.trim().split(";")
    if (!tag) continue
    const qParam = params.find((p) => p.trim().startsWith("q="))
    const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1
    if (Number.isNaN(q)) continue
    parsed.push({ primary: tag.trim().toLowerCase().split("-")[0], q })
  }

  parsed.sort((a, b) => b.q - a.q)

  for (const { primary } of parsed) {
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

export function resolveRequestLanguage(opts: {
  cookieValue?: string
  acceptLanguage: string | null
}): Language {
  return (
    languageFromCookie(opts.cookieValue) ??
    negotiateLanguage(opts.acceptLanguage)
  )
}
