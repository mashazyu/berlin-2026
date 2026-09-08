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

export type ResolvedCell = {
  topicId: string
  partyId: string
  stance: Stance
  summary: string
  /** Program link, with `#page=N` when a sourced page is known */
  programHref?: string
  /** Original program excerpt (never translated) */
  sourceQuote?: string
}

export type ResolvedComparison = {
  parties: Array<Party & { displayName: string }>
  topics: Array<Topic & { displayLabel: string }>
  cellsByKey: Record<string, ResolvedCell>
  lang: Language
}
