import type { MetadataRoute } from "next"
import {
  SUPPORTED_LANGUAGES,
  buildAbsoluteUrl,
} from "@/lib/seo/constants"
import { PAGES } from "@/lib/seo/pages"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
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
        lastModified,
        changeFrequency: page.changeFrequency ?? "monthly",
        priority: page.priority ?? 0.5,
        alternates: { languages },
      })
    }
  }

  return entries
}
