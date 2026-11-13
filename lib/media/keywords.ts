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
    if (needle && haystack.includes(needle)) hits.push(needle)
  }
  return hits
}
