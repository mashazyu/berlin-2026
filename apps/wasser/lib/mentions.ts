import mentionsData from "@/data/mentions.json"
import { getTranslations, type Language } from "@/lib/i18n"
import type { MentionItem } from "@kompass/landing"

type MentionFact = {
  id: string
  channel: string
  date: string
  postUrl: string
  kind: MentionItem["kind"]
}

export function getMentions(language: Language): MentionItem[] {
  const t = getTranslations(language)
  const facts = (mentionsData as { mentions: MentionFact[] }).mentions
  const summaries = t.mentionSummaries as Record<string, string>

  return facts.map((mention) => {
    const summary = summaries[mention.id]
    return {
      id: mention.id,
      date: mention.date,
      postUrl: mention.postUrl,
      kind: mention.kind,
      source: mention.channel,
      topics: summary ? [summary] : [],
      kindLabel: t.mentions.kindLabels[mention.kind] ?? mention.kind,
    }
  })
}
