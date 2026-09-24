import { statSync } from "node:fs"
import { join } from "node:path"
import type { MetadataRoute } from "next"
import type { Language } from "@/lib/i18n/types"
import {
  SUPPORTED_LANGUAGES,
  buildAbsoluteUrl,
} from "@/lib/seo/constants"
import { PAGES } from "@/lib/seo/pages"

function fileMtime(...segments: string[]): number {
  try {
    return statSync(join(process.cwd(), ...segments)).mtimeMs
  } catch {
    return 0
  }
}

/** lastmod from content sources (not build clock). */
function lastModifiedFor(lang: Language, path: string): Date {
  const localeMs = fileMtime("locales", `${lang}.json`)
  const comparisonMs = fileMtime("data", "comparison", "base.json")
  const isHome = !path || path === "/"
  const ms = isHome
    ? Math.max(localeMs, comparisonMs)
    : Math.max(localeMs, fileMtime("app", "[lang]", "about", "page.tsx"))
  return new Date(ms || Date.now())
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const page of Object.values(PAGES)) {
    if (page.indexable === false) continue
    const languages: Record<string, string> = {}
    for (const lang of SUPPORTED_LANGUAGES) {
      languages[lang] = buildAbsoluteUrl(lang, page.path)
    }
    languages["x-default"] = buildAbsoluteUrl("de", page.path)

    for (const lang of SUPPORTED_LANGUAGES) {
      entries.push({
        url: buildAbsoluteUrl(lang, page.path),
        lastModified: lastModifiedFor(lang, page.path),
        changeFrequency: page.changeFrequency ?? "monthly",
        priority: page.priority ?? 0.5,
        alternates: { languages },
      })
    }
  }

  return entries
}
