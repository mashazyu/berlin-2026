import comparisonData from "@/data/comparison.json"
import { pickLocalized } from "@/lib/i18n/fallback"
import type { Language } from "@/lib/i18n/types"
import type {
  ComparisonData,
  ResolvedCell,
  ResolvedComparison,
} from "./types"

const data = comparisonData as ComparisonData

export function cellKey(topicId: string, partyId: string): string {
  return `${topicId}::${partyId}`
}

export function getComparison(lang: Language): ResolvedComparison {
  const cellsByKey: Record<string, ResolvedCell> = {}

  for (const cell of data.cells) {
    cellsByKey[cellKey(cell.topicId, cell.partyId)] = {
      topicId: cell.topicId,
      partyId: cell.partyId,
      stance: cell.stance,
      summary: pickLocalized(cell.summary, lang),
    }
  }

  return {
    lang,
    parties: data.parties.map((party) => ({
      ...party,
      displayName: pickLocalized(party.name, lang) || party.shortName,
    })),
    topics: [...data.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((topic) => ({
        ...topic,
        displayLabel: pickLocalized(topic.label, lang),
      })),
    cellsByKey,
    analysis: {
      consensus: data.analysis.consensus.map((item) => ({
        id: item.id,
        title: pickLocalized(item.title, lang),
        body: pickLocalized(item.body, lang),
      })),
      divides: data.analysis.divides.map((item) => ({
        id: item.id,
        title: pickLocalized(item.title, lang),
        body: pickLocalized(item.body, lang),
      })),
      partyFeatures: data.analysis.partyFeatures.map((item) => ({
        id: item.id,
        title: pickLocalized(item.title, lang),
        body: pickLocalized(item.body, lang),
        partyId: item.partyId,
      })),
    },
  }
}

export function getRawComparison(): ComparisonData {
  return data
}
