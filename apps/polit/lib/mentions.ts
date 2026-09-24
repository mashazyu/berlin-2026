import type { MentionItem } from "@kompass/landing"
import type { Language } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"

const FACTS = [
  {
    id: "demo-1",
    date: "2026-02-15",
    postUrl: "https://example.com/polit-mention",
    kind: "newsletter" as const,
    source: {
      en: "Civic Digest",
      de: "Bürger-Digest",
      uk: "Громадянський дайджест",
    },
  },
]

export function getMentions(language: Language): MentionItem[] {
  const t = getTranslations(language)
  return FACTS.map((fact) => ({
    id: fact.id,
    date: fact.date,
    postUrl: fact.postUrl,
    kind: fact.kind,
    source: fact.source[language] ?? fact.source.en,
    topics: [],
    kindLabel: t.mentions.kindLabels[fact.kind],
  }))
}
