/**
 * Project mentions (Telegram, newsletters, Substack, articles).
 * Source names live in locales/*.json under mentionSummaries;
 * topic tag IDs resolve via mentions.topicLabels.
 */

import mentionsData from "@/data/mentions.json"
import { getTranslations, type Language, type Translations } from "@/lib/i18n/get-translations"

export type MentionKind = "telegram" | "newsletter" | "substack" | "article"

export type MentionTopicId = keyof Translations["mentions"]["topicLabels"]

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
  /** Localized topic labels (max used in UI is 2). */
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

function resolveTopics(
  topicIds: string[] | undefined,
  labels: Translations["mentions"]["topicLabels"]
): string[] {
  if (!topicIds?.length) return []
  return topicIds.map((id) => {
    if (id in labels) return labels[id as MentionTopicId]
    return id
  })
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
        topics: resolveTopics(localized?.topics, t.mentions.topicLabels),
        kindLabel: t.mentions.kindLabels[mention.kind],
      }
    })
}
