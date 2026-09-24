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
import it from "../../locales/it.json"
import { CONTACT_EMAIL, SUPPORTED_LANGUAGES } from "@/lib/seo/constants"
import { deepMergeWithFallback } from "./fallback"
import type { Language, Translations } from "./types"

export type { Language, Translations }
export { SUPPORTED_LANGUAGES }

/** Legal pages (privacy, impressum) are maintained in EN + DE only. */
export const LEGAL_LANGUAGES = ["en", "de"] as const satisfies readonly Language[]

export function legalLanguageFor(lang: Language): "en" | "de" {
  return lang === "en" ? "en" : "de"
}

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

function withGermanLegalFallback(
  lang: Language,
  translations: Translations,
  german: Translations
): Translations {
  if (lang === "en") return translations
  return {
    ...translations,
    privacy: german.privacy,
    impressum: german.impressum,
    metadata: {
      ...translations.metadata,
      privacyTitle: german.metadata.privacyTitle,
      privacyDescription: german.metadata.privacyDescription,
      impressumTitle: german.metadata.impressumTitle,
      impressumDescription: german.metadata.impressumDescription,
    },
  }
}

const enTranslations = injectContactEmail(en as Translations)
const deTranslations = injectContactEmail(
  deepMergeWithFallback(en as Translations, de as Partial<Translations>)
)

function buildLanguage(lang: Language, overlay: Partial<Translations>): Translations {
  const merged = injectContactEmail(
    deepMergeWithFallback(en as Translations, overlay)
  )
  return withGermanLegalFallback(lang, merged, deTranslations)
}

export const languages: Record<Language, Translations> = {
  en: enTranslations,
  de: deTranslations,
  tr: buildLanguage("tr", tr as Partial<Translations>),
  uk: buildLanguage("uk", uk as Partial<Translations>),
  pl: buildLanguage("pl", pl as Partial<Translations>),
  ru: buildLanguage("ru", ru as Partial<Translations>),
  ar: buildLanguage("ar", ar as Partial<Translations>),
  es: buildLanguage("es", es as Partial<Translations>),
  ku: buildLanguage("ku", ku as Partial<Translations>),
  vi: buildLanguage("vi", vi as Partial<Translations>),
  it: buildLanguage("it", it as Partial<Translations>),
}

export function getTranslations(lang: Language): Translations {
  return languages[lang] ?? languages.de
}

export function isLanguage(value: string): value is Language {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
}
