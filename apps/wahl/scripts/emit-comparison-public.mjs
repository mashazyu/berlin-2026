/**
 * Emit resolved comparison JSON for each language to public/data/comparison/{lang}.json
 * so the client can fetch a single locale without embedding it in the ISR/RSC page.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const DATA_DIR = path.join(ROOT, "data", "comparison")
const OUT_DIR = path.join(ROOT, "public", "data", "comparison")

const LANGS = [
  "en",
  "de",
  "tr",
  "ku",
  "vi",
  "pl",
  "ru",
  "uk",
  "ar",
  "es",
  "it",
]

function cellKey(topicId, partyId) {
  return `${topicId}::${partyId}`
}

function sourceHref(source) {
  if (!source?.url) return ""
  if (source.page != null && source.page > 0) {
    return `${source.url}#page=${source.page}`
  }
  return source.url
}

function bestProgramHref(sources, fallbackUrl) {
  const withPage = sources?.find((s) => s.page != null && s.page > 0)
  if (withPage) return sourceHref(withPage)
  const withUrl = sources?.find((s) => s.url)
  if (withUrl) return sourceHref(withUrl)
  return fallbackUrl || ""
}

function resolveSourceQuotes(sources, fallbackUrl) {
  if (!sources?.length) return []
  const seen = new Set()
  const quotes = []
  for (const source of sources) {
    const quote = source.quote?.trim()
    if (!quote) continue
    const key = quote.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    quotes.push({ quote, href: sourceHref(source) || fallbackUrl })
  }
  return quotes
}

function resolveSourceNotes(sources, fallbackUrl) {
  if (!sources?.length) return []
  const seen = new Set()
  const notes = []
  for (const source of sources) {
    const note = source.note?.trim()
    if (!note || source.quote?.trim()) continue
    const key = note.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    notes.push({ note, href: sourceHref(source) || fallbackUrl })
  }
  return notes
}

function resolveComparison(base, overlay, lang) {
  const partyUrl = Object.fromEntries(
    base.parties.map((p) => [p.id, p.programUrl]),
  )
  const cellsByKey = {}

  for (const cell of base.cells) {
    const key = cellKey(cell.topicId, cell.partyId)
    const fallback = partyUrl[cell.partyId] ?? ""
    const sourceQuotes = resolveSourceQuotes(cell.sources, fallback)
    const sourceNotes = resolveSourceNotes(cell.sources, fallback)
    const summary = overlay.cellSummaries?.[key] ?? ""
    cellsByKey[key] = {
      topicId: cell.topicId,
      partyId: cell.partyId,
      stance: cell.stance,
      summary,
      ...(sourceQuotes.length ? { sourceQuotes } : {}),
      ...(sourceNotes.length ? { sourceNotes } : {}),
      programHref:
        sourceQuotes[0]?.href ||
        sourceNotes[0]?.href ||
        bestProgramHref(cell.sources, fallback) ||
        undefined,
    }
    if (!cellsByKey[key].programHref) delete cellsByKey[key].programHref
  }

  const parties = base.parties.map((party) => ({
    id: party.id,
    shortName: party.shortName,
    programUrl: party.programUrl,
    displayName: overlay.partyNames?.[party.id] || party.shortName,
  }))

  const topics = [...base.topics]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((topic) => ({
      id: topic.id,
      group: topic.group,
      sortOrder: topic.sortOrder,
      displayLabel: overlay.topicLabels?.[topic.id] || "",
    }))

  return { lang, parties, topics, cellsByKey }
}

function main() {
  const basePath = path.join(DATA_DIR, "base.json")
  if (!fs.existsSync(basePath)) {
    console.error(`Missing ${basePath} — run pnpm split:comparison first`)
    process.exit(1)
  }

  const base = JSON.parse(fs.readFileSync(basePath, "utf8"))
  fs.mkdirSync(OUT_DIR, { recursive: true })

  for (const lang of LANGS) {
    const overlayPath = path.join(DATA_DIR, `${lang}.json`)
    if (!fs.existsSync(overlayPath)) {
      console.error(`Missing ${overlayPath}`)
      process.exit(1)
    }
    const overlay = JSON.parse(fs.readFileSync(overlayPath, "utf8"))
    const resolved = resolveComparison(base, overlay, lang)
    const outPath = path.join(OUT_DIR, `${lang}.json`)
    fs.writeFileSync(outPath, `${JSON.stringify(resolved)}\n`)
    console.log(
      `Wrote ${path.relative(ROOT, outPath)} (${fs.statSync(outPath).size} bytes)`,
    )
  }
}

main()
