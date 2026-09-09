import comparisonData from "@/data/comparison.json"
import { pickLocalized } from "@/lib/i18n/fallback"
import type { Language } from "@/lib/i18n/types"
import { bestProgramHref, sourceHref } from "./source-href"
import type {
  CellSource,
  ComparisonData,
  ResolvedCell,
  ResolvedComparison,
  ResolvedSourceNote,
  ResolvedSourceQuote,
} from "./types"

const data = comparisonData as ComparisonData

export function cellKey(topicId: string, partyId: string): string {
  return `${topicId}::${partyId}`
}

function resolveSourceQuotes(
  sources: CellSource[] | undefined,
  fallbackUrl: string,
): ResolvedSourceQuote[] {
  if (!sources?.length) return []

  const seen = new Set<string>()
  const quotes: ResolvedSourceQuote[] = []

  for (const source of sources) {
    const quote = source.quote?.trim()
    if (!quote) continue
    const key = quote.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    quotes.push({
      quote,
      href: sourceHref(source) || fallbackUrl,
    })
  }

  return quotes
}

function resolveSourceNotes(
  sources: CellSource[] | undefined,
  fallbackUrl: string,
): ResolvedSourceNote[] {
  if (!sources?.length) return []

  const seen = new Set<string>()
  const notes: ResolvedSourceNote[] = []

  for (const source of sources) {
    const note = source.note?.trim()
    if (!note || source.quote?.trim()) continue
    const key = note.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    notes.push({
      note,
      href: sourceHref(source) || fallbackUrl,
    })
  }

  return notes
}

export function getComparison(lang: Language): ResolvedComparison {
  const cellsByKey: Record<string, ResolvedCell> = {}
  const partyUrl = Object.fromEntries(
    data.parties.map((party) => [party.id, party.programUrl]),
  )

  for (const cell of data.cells) {
    const fallback = partyUrl[cell.partyId] ?? ""
    const sourceQuotes = resolveSourceQuotes(cell.sources, fallback)
    const sourceNotes = resolveSourceNotes(cell.sources, fallback)
    cellsByKey[cellKey(cell.topicId, cell.partyId)] = {
      topicId: cell.topicId,
      partyId: cell.partyId,
      stance: cell.stance,
      summary: pickLocalized(cell.summary, lang),
      sourceQuotes: sourceQuotes.length ? sourceQuotes : undefined,
      sourceNotes: sourceNotes.length ? sourceNotes : undefined,
      programHref:
        sourceQuotes[0]?.href ||
        sourceNotes[0]?.href ||
        bestProgramHref(cell.sources, fallback) ||
        undefined,
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
