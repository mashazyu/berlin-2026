import baseData from "@/data/comparison/base.json"
import arOverlay from "@/data/comparison/ar.json"
import deOverlay from "@/data/comparison/de.json"
import enOverlay from "@/data/comparison/en.json"
import esOverlay from "@/data/comparison/es.json"
import itOverlay from "@/data/comparison/it.json"
import kuOverlay from "@/data/comparison/ku.json"
import plOverlay from "@/data/comparison/pl.json"
import ruOverlay from "@/data/comparison/ru.json"
import trOverlay from "@/data/comparison/tr.json"
import ukOverlay from "@/data/comparison/uk.json"
import viOverlay from "@/data/comparison/vi.json"
import type { Language } from "@/lib/i18n/types"
import { bestProgramHref, sourceHref } from "./source-href"
import { cellKey } from "./cell-key"
import type {
  CellSource,
  ComparisonBase,
  ComparisonData,
  ComparisonLangOverlay,
  ResolvedCell,
  ResolvedComparison,
  ResolvedSourceNote,
  ResolvedSourceQuote,
} from "./types"

const base = baseData as ComparisonBase

const overlays: Record<Language, ComparisonLangOverlay> = {
  en: enOverlay as ComparisonLangOverlay,
  de: deOverlay as ComparisonLangOverlay,
  tr: trOverlay as ComparisonLangOverlay,
  ku: kuOverlay as ComparisonLangOverlay,
  vi: viOverlay as ComparisonLangOverlay,
  pl: plOverlay as ComparisonLangOverlay,
  ru: ruOverlay as ComparisonLangOverlay,
  uk: ukOverlay as ComparisonLangOverlay,
  ar: arOverlay as ComparisonLangOverlay,
  es: esOverlay as ComparisonLangOverlay,
  it: itOverlay as ComparisonLangOverlay,
}

export { cellKey }

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
  const overlay = overlays[lang] ?? overlays.en
  const cellsByKey: Record<string, ResolvedCell> = {}
  const partyUrl = Object.fromEntries(
    base.parties.map((party) => [party.id, party.programUrl]),
  )

  for (const cell of base.cells) {
    const key = cellKey(cell.topicId, cell.partyId)
    const fallback = partyUrl[cell.partyId] ?? ""
    const sourceQuotes = resolveSourceQuotes(cell.sources, fallback)
    const sourceNotes = resolveSourceNotes(cell.sources, fallback)
    cellsByKey[key] = {
      topicId: cell.topicId,
      partyId: cell.partyId,
      stance: cell.stance,
      summary: overlay.cellSummaries[key] ?? "",
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
    parties: base.parties.map((party) => ({
      id: party.id,
      shortName: party.shortName,
      programUrl: party.programUrl,
      displayName: overlay.partyNames[party.id] || party.shortName,
    })),
    topics: [...base.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((topic) => ({
        id: topic.id,
        group: topic.group,
        sortOrder: topic.sortOrder,
        displayLabel: overlay.topicLabels[topic.id] ?? "",
      })),
    cellsByKey,
  }
}

/** Rebuild monolith shape for tooling that still expects ComparisonData. */
export function getRawComparison(): ComparisonData {
  const langs = Object.keys(overlays) as Language[]
  return {
    parties: base.parties.map((party) => {
      const name = {} as ComparisonData["parties"][number]["name"]
      for (const lang of langs) {
        const v = overlays[lang].partyNames[party.id]
        if (v) name[lang] = v
      }
      if (!name.en) name.en = party.shortName
      return { ...party, name }
    }),
    topics: base.topics.map((topic) => {
      const label = {} as ComparisonData["topics"][number]["label"]
      for (const lang of langs) {
        const v = overlays[lang].topicLabels[topic.id]
        if (v) label[lang] = v
      }
      if (!label.en) label.en = topic.id
      return { ...topic, label }
    }),
    cells: base.cells.map((cell) => {
      const key = cellKey(cell.topicId, cell.partyId)
      const summary = {} as ComparisonData["cells"][number]["summary"]
      for (const lang of langs) {
        const v = overlays[lang].cellSummaries[key]
        if (v) summary[lang] = v
      }
      if (!summary.en) summary.en = ""
      return {
        topicId: cell.topicId,
        partyId: cell.partyId,
        stance: cell.stance,
        summary,
        ...(cell.sources?.length ? { sources: cell.sources } : {}),
      }
    }),
  }
}
