/**
 * Press mention publications — language-neutral facts (URLs, date, image).
 * Channel names and summaries live in locales/*.json under pressMentionSummaries.
 */

import pressMentionsData from "@/data/press-mentions.json"
import { getTranslations, type Language } from "@/lib/i18n/get-translations"

export type PressMentionFact = {
  id: string
  /** ISO date: YYYY-MM-DD for exact day, or YYYY-MM for month only */
  date: string
  postUrl: string
  image: string | null
}

export type PressMention = PressMentionFact & {
  channel: string
  summary: string
}

type PressMentionsFile = {
  pressMentions: PressMentionFact[]
}

export function getPressMentions(language: Language): PressMention[] {
  const summaries = getTranslations(language).pressMentionSummaries
  const byId = new Map(summaries.map((item) => [item.id, item]))

  return (pressMentionsData as PressMentionsFile).pressMentions.map((mention) => {
    const localized = byId.get(mention.id)
    return {
      ...mention,
      channel: localized?.channel ?? mention.id,
      summary: localized?.summary ?? "",
    }
  })
}
