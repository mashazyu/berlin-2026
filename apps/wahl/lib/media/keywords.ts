import type { TopicGroup } from "@/lib/comparison/types"
import { TOPIC_GROUP_ORDER } from "@/lib/comparison/groups"
import baseComparison from "@/data/comparison/base.json"
import deComparison from "@/data/comparison/de.json"

/**
 * Parties with seats in the Abgeordnetenhaus and/or relevant at Bund level.
 * Matched against NFD-normalized lowercase text (umlauts stripped).
 */
export const PARTY_KEYWORDS = [
  "cdu",
  "spd",
  "grune",
  "grunen",
  "bundnis 90",
  "linke",
  "die linke",
  "afd",
  "bsw",
  "bundnis sahra",
  "fdp",
  "union",
] as const

export const INSTITUTION_KEYWORDS = [
  "abgeordnetenhaus",
  "agh",
  "rotes rathaus",
  "berliner senat",
  "senat von berlin",
  "regierender burgermeister",
  "regierende burgermeisterin",
  "koalitionsverhandlung",
  "koalitionsvertrag",
  "bvv",
  "bundestag",
  "bundesregierung",
  "bundesrat",
  "kanzler",
  "kanzlerin",
] as const

export const BERLIN_KEYWORDS = [
  "berlin",
  "berliner",
  "berlins",
  "pankow",
  "neukolln",
  "kreuzberg",
  "charlottenburg",
  "spandau",
  "lichtenberg",
  "marzahn",
  "treptow",
  "tempelhof",
  "steglitz",
  "zehlendorf",
  "reinickendorf",
  "friedrichshain",
] as const

/** Extra high-precision news terms per group (beyond comparison labels). */
const TOPIC_GROUP_EXTRA: Partial<Record<TopicGroup, readonly string[]>> = {
  transport: [
    "verkehr",
    "s-bahn",
    "u-bahn",
    "bvg",
    "radweg",
    "fahrrad",
    "autobahn",
    "flughafen",
    "parkplatz",
    "parkraumbewirtschaftung",
    "mobilitat",
    "oepnv",
  ],
  waste: ["sperrmull", "wilder mull", "vermullung", "stadtbild"],
  climate_energy: [
    "energiewende",
    "klimakrise",
    "co2",
    "emissionen",
    "kohleausstieg",
  ],
  animals: ["tierwohl", "schlachthof"],
  housing: [
    "mietpreisbremse",
    "mieterhohe",
    "wohnungsnot",
    "sozialwohnung",
    "wohnungsbau",
  ],
  security: ["kriminalitat", "innensenator", "messerattacke", "feuerwehr"],
  education: ["grundschule", "oberschule", "lehrermangel", "kitaplatz"],
  health: ["charite", "notaufnahme", "drogenkonsum"],
  migration: ["fluchtlinge", "asylbewerber", "abschiebung", "bezahlkarte"],
  economy: ["mindestlohn", "arbeitsmarkt", "konjunktur", "start-up", "startup"],
  society: ["armutsgrenze", "grundsicherung", "clubkultur", "schwimmbad"],
  democracy: [
    "wahlrecht",
    "funf-prozent",
    "5-prozent",
    "lobbyismus",
    "parteispende",
  ],
}

const LABEL_STOPWORDS = new Set([
  "und",
  "oder",
  "der",
  "die",
  "das",
  "den",
  "dem",
  "des",
  "ein",
  "eine",
  "einer",
  "einem",
  "eines",
  "fur",
  "von",
  "vom",
  "im",
  "in",
  "zu",
  "zum",
  "zur",
  "mit",
  "auf",
  "aus",
  "bei",
  "nach",
  "vor",
  "uber",
  "unter",
  "gegen",
  "ohne",
  "um",
  "am",
  "an",
  "als",
  "auch",
  "nur",
  "nicht",
  "noch",
  "schon",
  "sehr",
  "mehr",
  "große",
  "großer",
  "grosser",
  "kleine",
  "kleiner",
  "mittlere",
  "the",
  "and",
  "for",
  "of",
  "to",
  "a",
  "an",
])

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Phrase → substring. Single token → must start a word
 * (matches "verkehr" in "verkehrssenatorin", not "ber" in "uber",
 * not "bildung" in "regierungsbildung").
 */
export function matchesTerm(haystack: string, term: string): boolean {
  const needle = term.trim()
  if (!needle) return false
  if (needle.includes(" ") || needle.includes("/") || needle.includes("-")) {
    return haystack.includes(needle)
  }
  const re = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escapeRegex(needle)}`,
    "u"
  )
  return re.test(haystack)
}

function tokensFromLabel(label: string): string[] {
  const normalized = normalizeText(label)
  const parts = normalized
    .split(/[^a-z0-9]+/g)
    .map((part) => part.trim())
    .filter(Boolean)

  const out: string[] = []
  for (const part of parts) {
    if (part.length < 5) continue
    if (LABEL_STOPWORDS.has(part)) continue
    // Skip bare stems that are common false positives in political headlines.
    if (
      part === "bildung" ||
      part === "gesellschaft" ||
      part === "arbeit" ||
      part === "kontrolle" ||
      part === "ziele" ||
      part === "zugang" ||
      part === "qualitat" ||
      part === "themen" ||
      part === "menschen" ||
      part === "raum" ||
      part === "steuer" ||
      part === "steuern" ||
      part === "schutz" ||
      part === "prozent" ||
      part === "hurde" ||
      part === "daten" ||
      part === "einkommen" ||
      part === "leistungen" ||
      part === "medizin" ||
      part === "geldstrome" ||
      part === "befugnisse" ||
      part === "anforderungen" ||
      part === "vorbereitung" ||
      part === "klasse" ||
      part === "personal" ||
      part === "screens" ||
      part === "betriebe" ||
      part === "innovation" ||
      part === "tempelhofer" ||
      part === "feld" ||
      part === "neubau" ||
      part === "ersten" ||
      part === "umstrittene" ||
      part === "start" ||
      part === "ups" ||
      part === "anlasslose" ||
      part === "streitene" ||
      part === "sprecherin"
    ) {
      continue
    }
    out.push(part)
  }

  // Keep hyphenated compounds (u-bahn-neubau, start-ups → handled as phrases).
  for (const compound of normalized.match(/[a-z0-9]+(?:-[a-z0-9]+)+/g) ?? []) {
    if (compound.length >= 5) out.push(compound)
  }

  // Keep short multi-word phrases from the label (e.g. "tempelhofer feld").
  const phrase = normalized
    .replace(/[/,—–|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (phrase.includes(" ") && phrase.length >= 10 && phrase.length <= 48) {
    out.push(phrase)
  }

  return out
}

function buildTopicGroupKeywords(): Record<TopicGroup, string[]> {
  const map: Record<TopicGroup, Set<string>> = {
    transport: new Set(),
    waste: new Set(),
    climate_energy: new Set(),
    animals: new Set(),
    housing: new Set(),
    security: new Set(),
    education: new Set(),
    health: new Set(),
    migration: new Set(),
    economy: new Set(),
    society: new Set(),
    democracy: new Set(),
    other: new Set(),
  }

  const labels = deComparison.topicLabels as Record<string, string>
  for (const topic of baseComparison.topics as { id: string; group: TopicGroup }[]) {
    const label = labels[topic.id]
    if (!label) continue
    for (const token of tokensFromLabel(label)) {
      map[topic.group].add(token)
    }
    // Full normalized label as phrase when distinctive.
    const full = normalizeText(label)
      .replace(/[/,—–|]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (full.length >= 8) map[topic.group].add(full)
  }

  for (const [group, extras] of Object.entries(TOPIC_GROUP_EXTRA) as [
    TopicGroup,
    readonly string[],
  ][]) {
    for (const extra of extras) {
      map[group].add(normalizeText(extra))
    }
  }

  return Object.fromEntries(
    Object.entries(map).map(([group, set]) => [group, [...set]])
  ) as Record<TopicGroup, string[]>
}

export const TOPIC_GROUP_KEYWORDS: Record<TopicGroup, readonly string[]> =
  buildTopicGroupKeywords()

export const MEDIA_TOPIC_GROUPS: TopicGroup[] = TOPIC_GROUP_ORDER.filter(
  (group) => group !== "other"
)

export function matchTopicGroups(haystack: string): TopicGroup[] {
  const hits: TopicGroup[] = []
  for (const group of MEDIA_TOPIC_GROUPS) {
    const keywords = TOPIC_GROUP_KEYWORDS[group]
    if (keywords.some((keyword) => matchesTerm(haystack, keyword))) {
      hits.push(group)
    }
  }
  return hits
}

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
}

export function matchesAny(
  haystack: string,
  needles: readonly string[]
): string[] {
  const hits: string[] = []
  for (const needle of needles) {
    // Substring match: party/institution stems ("linke" → "linken").
    if (needle && haystack.includes(needle)) hits.push(needle)
  }
  return hits
}
