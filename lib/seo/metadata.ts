import type { Metadata } from "next"
import { getTranslations, type Language } from "@/lib/i18n/get-translations"
import {
  BASE_URL,
  CONTENT_LANGUAGE,
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  buildAbsoluteUrl,
  normalizePath,
  toSafeLanguage,
} from "@/lib/seo/constants"
import { PAGES, type PageKey } from "@/lib/seo/pages"

const OG_LOCALES: Record<Language, string> = {
  en: "en_US",
  de: "de_DE",
  ru: "ru_RU",
}

function buildLanguageAlternates(path: string): Record<string, string> {
  const np = normalizePath(path)
  const map: Record<string, string> = {}
  for (const lang of SUPPORTED_LANGUAGES) {
    map[lang] = `${BASE_URL}/${lang}${np}`
  }
  map["x-default"] = `${BASE_URL}/${DEFAULT_LANGUAGE}${np}`
  return map
}

export function pageMetadata(key: PageKey) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ lang: string }>
  }): Promise<Metadata> {
    const { lang } = await params
    const safeLang = toSafeLanguage(lang)
    const contentLanguage = CONTENT_LANGUAGE[safeLang]
    const t = getTranslations(safeLang)
    const { path, getMetadata, indexable = true } = PAGES[key]
    const { title, description, keywords } = getMetadata(t)
    const fullUrl = buildAbsoluteUrl(safeLang, path)

    return {
      title,
      description,
      keywords,
      other: {
        "content-language": contentLanguage,
      },
      robots: indexable ? undefined : { index: false, follow: true },
      alternates: {
        canonical: fullUrl,
        languages: buildLanguageAlternates(path),
      },
      openGraph: {
        title,
        description,
        locale: OG_LOCALES[safeLang],
        url: fullUrl,
        type: "website",
        siteName: "Berlin 2026",
        images: [
          {
            url: `${BASE_URL}/${safeLang}/opengraph-image?v=3`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${BASE_URL}/${safeLang}/opengraph-image?v=3`],
      },
    }
  }
}
