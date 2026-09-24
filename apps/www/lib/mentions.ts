import type { MentionItem } from "@kompass/landing"
import type { Language } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"

const FACTS = [
  {
    id: "demo-1",
    date: "2026-03-01",
    postUrl: "https://example.com/demo-mention",
    kind: "article" as const,
    source: {
      en: "Example News",
      de: "Beispiel Nachrichten",
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
