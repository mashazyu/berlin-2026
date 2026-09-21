import type { Language, LocalizedString } from "@/lib/i18n/types"

export type Stance = "for" | "against" | "mixed" | "none"

export type Party = {
  id: string
  name: LocalizedString
  shortName: string
  programUrl: string
}

export type TopicGroup =
  | "transport"
  | "waste"
  | "climate_energy"
  | "animals"
  | "housing"
  | "security"
  | "education"
  | "health"
  | "migration"
  | "economy"
  | "society"
  | "democracy"
  | "other"

export type Topic = {
  id: string
  group: TopicGroup
  label: LocalizedString
  sortOrder: number
}

/** Evidence linking a cell claim to an official program PDF. */
export type CellSource = {
  /** Party program PDF URL */
  url: string
  /** Printed/PDF page number when known */
  page?: number
  /** Stable program heading, e.g. "Jetzt Heizen für Berlin klimaneutral machen" */
  section?: string
  /** German excerpt ≤ ~200 chars to re-find the claim */
  quote?: string
  /** For stance none / absence: search terms checked */
  note?: string
}

export type Cell = {
  topicId: string
  partyId: string
  stance: Stance
  summary: LocalizedString
  /** Optional audit sources (pilot: Volt). Quote shown in UI in original language. */
  sources?: CellSource[]
}

export type ComparisonData = {
  parties: Party[]
  topics: Topic[]
  cells: Cell[]
}

/** Language-agnostic comparison structure (data/comparison/base.json). */
export type ComparisonBase = {
  parties: Array<{
    id: string
    shortName: string
    programUrl: string
  }>
  topics: Array<{
    id: string
    group: TopicGroup
    sortOrder: number
  }>
  cells: Array<{
    topicId: string
    partyId: string
    stance: Stance
    sources?: CellSource[]
  }>
}

/** Per-language strings (data/comparison/{lang}.json). */
export type ComparisonLangOverlay = {
  lang: Language
  partyNames: Record<string, string>
  topicLabels: Record<string, string>
  cellSummaries: Record<string, string>
}

export type ResolvedSourceQuote = {
  /** Original program excerpt (never translated) */
  quote: string
  /** Deep link into the program PDF when available */
  href: string
}

export type ResolvedSourceNote = {
  /** Absence / search note (German audit note, shown as-is) */
  note: string
  href: string
}

export type ResolvedCell = {
  topicId: string
  partyId: string
  stance: Stance
  summary: string
  /** Program link, with `#page=N` when a sourced page is known */
  programHref?: string
  /** All original excerpts for claims in this cell (never translated) */
  sourceQuotes?: ResolvedSourceQuote[]
  /** Absence notes when a topic is not in the program */
  sourceNotes?: ResolvedSourceNote[]
}

export type ResolvedParty = {
  id: string
  shortName: string
  programUrl: string
  displayName: string
}

export type ResolvedTopic = {
  id: string
  group: TopicGroup
  sortOrder: number
  displayLabel: string
}

export type ResolvedComparison = {
  parties: ResolvedParty[]
  topics: ResolvedTopic[]
  cellsByKey: Record<string, ResolvedCell>
  lang: Language
}
