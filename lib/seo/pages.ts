import type { Translations } from "@/lib/i18n/types"
import type { MetadataRoute } from "next"
import { metaDescription } from "@/lib/seo/meta-helpers"

export type PageKey = "home" | "about" | "privacy" | "aiDisclosure"

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>

export interface PageMetaStrings {
  title: string
  description: string
  keywords?: string[]
}

export interface PageConfig {
  path: string
  getMetadata: (t: Translations) => PageMetaStrings
  priority?: number
  changeFrequency?: ChangeFrequency
  indexable?: boolean
}

/** Sharing title/description always mirror on-page hero copy. */
export function homeSharingMeta(t: Translations): PageMetaStrings {
  return {
    title: `${t.brand.name} — ${t.hero.headline}`,
    description: metaDescription(`${t.hero.support}. ${t.hero.blurb}`),
    keywords: t.metadata.keywords,
  }
}

export const PAGES: Record<PageKey, PageConfig> = {
  home: {
    path: "",
    priority: 1,
    changeFrequency: "weekly",
    getMetadata: homeSharingMeta,
  },
  about: {
    path: "/about",
    priority: 0.6,
    changeFrequency: "monthly",
    getMetadata: (t) => ({
      title: `${t.about.title} — ${t.brand.name}`,
      description: metaDescription(t.metadata.aboutDescription),
    }),
  },
  privacy: {
    path: "/privacy",
    indexable: false,
    getMetadata: (t) => ({
      title: `${t.privacy.title} — ${t.brand.name}`,
      description: metaDescription(t.metadata.privacyDescription),
    }),
  },
  aiDisclosure: {
    path: "/ai-disclosure",
    indexable: false,
    getMetadata: (t) => ({
      title: `${t.aiDisclosure.title} — ${t.brand.name}`,
      description: metaDescription(t.metadata.aiDisclosureDescription),
    }),
  },
}
