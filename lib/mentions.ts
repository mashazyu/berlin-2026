/**
 * Project mentions (Telegram, newsletters, Substack, articles).
 * Source names and headlines live in locales/*.json under mentionSummaries.
 */

import mentionsData from "@/data/mentions.json"
import { getTranslations, type Language } from "@/lib/i18n/get-translations"

export type MentionKind = "telegram" | "newsletter" | "substack" | "article"

export type MentionFact = {
  id: string
  /** ISO date: YYYY-MM-DD for exact day, or YYYY-MM for month only */
  date: string
  postUrl: string
  kind: MentionKind
  /** Locales where this mention should appear on the about page */
  languages: Language[]
}

export type Mention = MentionFact & {
  source: string
  headline: string
  kindLabel: string
}

type MentionsFile = {
  mentions: MentionFact[]
}

export function getMentions(language: Language): Mention[] {
  const t = getTranslations(language)
  const byId = new Map(t.mentionSummaries.map((item) => [item.id, item]))

  return (mentionsData as MentionsFile).mentions
    .filter((mention) => mention.languages.includes(language))
    .map((mention) => {
      const localized = byId.get(mention.id)
      return {
        ...mention,
        source: localized?.source ?? mention.id,
        headline: localized?.headline ?? "",
        kindLabel: t.mentions.kindLabels[mention.kind],
      }
    })
}
