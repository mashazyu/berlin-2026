import type { Translations } from "@/lib/i18n/types"
import type { MetadataRoute } from "next"
import { metaDescription } from "@/lib/seo/meta-helpers"

export type PageKey = "home" | "privacy" | "aiDisclosure"

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

export const PAGES: Record<PageKey, PageConfig> = {
  home: {
    path: "",
    priority: 1,
    changeFrequency: "weekly",
    getMetadata: (t) => ({
      title: t.metadata.homeTitle,
      description: metaDescription(t.metadata.homeDescription),
      keywords: t.metadata.keywords,
    }),
  },
  privacy: {
    path: "/privacy",
    indexable: false,
    getMetadata: (t) => ({
      title: t.metadata.privacyTitle,
      description: metaDescription(t.metadata.privacyDescription),
    }),
  },
  aiDisclosure: {
    path: "/ai-disclosure",
    indexable: false,
    getMetadata: (t) => ({
      title: t.metadata.aiDisclosureTitle,
      description: metaDescription(t.metadata.aiDisclosureDescription),
    }),
  },
}
