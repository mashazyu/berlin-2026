import type { MetadataRoute } from "next"
import {
  BASE_URL,
  SITEMAP_LASTMOD,
  SUPPORTED_LANGUAGES,
  buildAbsoluteUrl,
} from "@/lib/seo/constants"
import { PAGES } from "@/lib/seo/pages"

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const page of Object.values(PAGES)) {
    if (page.indexable === false) continue
    for (const lang of SUPPORTED_LANGUAGES) {
      entries.push({
        url: buildAbsoluteUrl(lang, page.path),
        lastModified: SITEMAP_LASTMOD,
        changeFrequency: page.changeFrequency ?? "monthly",
        priority: page.priority ?? 0.5,
      })
    }
  }

  // Help discovery of the apex via www home
  entries.push({
    url: `${BASE_URL}/en`,
    lastModified: SITEMAP_LASTMOD,
    changeFrequency: "weekly",
    priority: 1,
  })

  return entries
}
