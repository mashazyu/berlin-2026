import comparisonData from "@/data/comparison.json"
import { pickLocalized } from "@/lib/i18n/fallback"
import type { Language } from "@/lib/i18n/types"
import { bestProgramHref, sourceHref } from "./source-href"
import type {
  ComparisonData,
  ResolvedCell,
  ResolvedComparison,
} from "./types"

const data = comparisonData as ComparisonData

export function cellKey(topicId: string, partyId: string): string {
  return `${topicId}::${partyId}`
}

function resolveSourceQuote(sources: ComparisonData["cells"][number]["sources"]): {
  sourceQuote?: string
  programHref?: string
} {
  const quoted = sources?.find((s) => s.quote?.trim())
  if (quoted?.quote) {
    return {
      sourceQuote: quoted.quote.trim(),
      programHref: sourceHref(quoted),
    }
  }
  return {}
}

export function getComparison(lang: Language): ResolvedComparison {
  const cellsByKey: Record<string, ResolvedCell> = {}
  const partyUrl = Object.fromEntries(
    data.parties.map((party) => [party.id, party.programUrl]),
  )

  for (const cell of data.cells) {
    const fallback = partyUrl[cell.partyId] ?? ""
    const { sourceQuote, programHref: quoteHref } = resolveSourceQuote(
      cell.sources,
    )
    cellsByKey[cellKey(cell.topicId, cell.partyId)] = {
      topicId: cell.topicId,
      partyId: cell.partyId,
      stance: cell.stance,
      summary: pickLocalized(cell.summary, lang),
      sourceQuote,
      programHref:
        quoteHref || bestProgramHref(cell.sources, fallback) || undefined,
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
  }
}

export function getRawComparison(): ComparisonData {
  return data
}
