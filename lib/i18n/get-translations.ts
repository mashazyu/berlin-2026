import en from "../../locales/en.json"
import de from "../../locales/de.json"
import ru from "../../locales/ru.json"
import tr from "../../locales/tr.json"
import uk from "../../locales/uk.json"
import pl from "../../locales/pl.json"
import ar from "../../locales/ar.json"
import es from "../../locales/es.json"
import ku from "../../locales/ku.json"
import vi from "../../locales/vi.json"
import { CONTACT_EMAIL, SUPPORTED_LANGUAGES } from "@/lib/seo/constants"
import { deepMergeWithFallback } from "./fallback"
import type { Language, Translations } from "./types"

export type { Language, Translations }
export { SUPPORTED_LANGUAGES }

function injectContactEmail<T>(value: T): T {
  if (typeof value === "string") {
    return value.replaceAll("{email}", CONTACT_EMAIL) as T
  }
  if (Array.isArray(value)) {
    return value.map((item) => injectContactEmail(item)) as T
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, child] of Object.entries(value)) {
      out[key] = injectContactEmail(child)
    }
    return out as T
  }
  return value
}

export const languages: Record<Language, Translations> = {
  en: injectContactEmail(en as Translations),
  de: injectContactEmail(
    deepMergeWithFallback(en as Translations, de as Partial<Translations>)
  ),
  tr: injectContactEmail(
    deepMergeWithFallback(en as Translations, tr as Partial<Translations>)
  ),
  uk: injectContactEmail(
    deepMergeWithFallback(en as Translations, uk as Partial<Translations>)
  ),
  pl: injectContactEmail(
    deepMergeWithFallback(en as Translations, pl as Partial<Translations>)
  ),
  ru: injectContactEmail(
    deepMergeWithFallback(en as Translations, ru as Partial<Translations>)
  ),
  ar: injectContactEmail(
    deepMergeWithFallback(en as Translations, ar as Partial<Translations>)
  ),
  es: injectContactEmail(
    deepMergeWithFallback(en as Translations, es as Partial<Translations>)
  ),
  ku: injectContactEmail(
    deepMergeWithFallback(en as Translations, ku as Partial<Translations>)
  ),
  vi: injectContactEmail(
    deepMergeWithFallback(en as Translations, vi as Partial<Translations>)
  ),
}

export function getTranslations(lang: Language): Translations {
  return languages[lang] ?? languages.en
}

export function isLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}
