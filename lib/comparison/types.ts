import type { Language, LocalizedString } from "@/lib/i18n/types"

export type Stance = "for" | "against" | "mixed" | "none"

export type Party = {
  id: string
  name: LocalizedString
  shortName: string
  programUrl: string
}

export type Topic = {
  id: string
  group: "climate_energy" | "transport" | "public_space" | "waste" | "animals"
  label: LocalizedString
  sortOrder: number
}

export type Cell = {
  topicId: string
  partyId: string
  stance: Stance
  summary: LocalizedString
}

export type AnalysisItem = {
  id: string
  title: LocalizedString
  body: LocalizedString
  partyId?: string
}

export type ComparisonData = {
  parties: Party[]
  topics: Topic[]
  cells: Cell[]
  analysis: {
    consensus: AnalysisItem[]
    divides: AnalysisItem[]
    partyFeatures: AnalysisItem[]
  }
}

export type ResolvedCell = {
  topicId: string
  partyId: string
  stance: Stance
  summary: string
}

export type ResolvedComparison = {
  parties: Array<Party & { displayName: string }>
  topics: Array<Topic & { displayLabel: string }>
  cellsByKey: Record<string, ResolvedCell>
  analysis: {
    consensus: Array<{ id: string; title: string; body: string }>
    divides: Array<{ id: string; title: string; body: string }>
    partyFeatures: Array<{
      id: string
      title: string
      body: string
      partyId?: string
    }>
  }
  lang: Language
}
