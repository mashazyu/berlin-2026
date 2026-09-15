/**
 * Project mentions (Telegram, newsletters, Substack, articles).
 * Source names and topics live in locales/*.json under mentionSummaries.
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
  /** Optional logo under /public (e.g. /mentions/handpicked.png) */
  logo?: string
  /**
   * Locales where this mention should appear.
   * Omit or leave empty to show in every language.
   */
  languages?: Language[]
}

export type Mention = MentionFact & {
  source: string
  topics: string[]
  kindLabel: string
}

type MentionsFile = {
  mentions: MentionFact[]
}

function isVisibleInLanguage(
  mention: MentionFact,
  language: Language
): boolean {
  const langs = mention.languages
  return !langs?.length || langs.includes(language)
}

export function getMentions(language: Language): Mention[] {
  const t = getTranslations(language)
  const byId = new Map(t.mentionSummaries.map((item) => [item.id, item]))

  return (mentionsData as MentionsFile).mentions
    .filter((mention) => isVisibleInLanguage(mention, language))
    .map((mention) => {
      const localized = byId.get(mention.id)
      return {
        ...mention,
        source: localized?.source ?? mention.id,
        topics: localized?.topics ?? [],
        kindLabel: t.mentions.kindLabels[mention.kind],
      }
    })
}
