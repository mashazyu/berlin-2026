/**
 * Assemble data/comparison.json from data/comparison/base.json + {lang}.json overlays.
 * Used by Python verify/translate scripts that still expect the monolith.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const DIR = path.join(ROOT, "data", "comparison")
const OUT = path.join(ROOT, "data", "comparison.json")

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

function main() {
  const basePath = path.join(DIR, "base.json")
  if (!fs.existsSync(basePath)) {
    console.error(`Missing ${basePath} — run pnpm split:comparison first`)
    process.exit(1)
  }

  const base = JSON.parse(fs.readFileSync(basePath, "utf8"))
  /** @type {Record<string, any>} */
  const overlays = {}
  for (const lang of LANGS) {
    const p = path.join(DIR, `${lang}.json`)
    if (!fs.existsSync(p)) {
      console.error(`Missing ${p}`)
      process.exit(1)
    }
    overlays[lang] = JSON.parse(fs.readFileSync(p, "utf8"))
  }

  const parties = base.parties.map((party) => {
    /** @type {Record<string, string>} */
    const name = {}
    for (const lang of LANGS) {
      const v = overlays[lang].partyNames?.[party.id]
      if (v) name[lang] = v
    }
    return { ...party, name }
  })

  const topics = base.topics.map((topic) => {
    /** @type {Record<string, string>} */
    const label = {}
    for (const lang of LANGS) {
      const v = overlays[lang].topicLabels?.[topic.id]
      if (v) label[lang] = v
    }
    return { ...topic, label }
  })

  const cells = base.cells.map((cell) => {
    const key = `${cell.topicId}::${cell.partyId}`
    /** @type {Record<string, string>} */
    const summary = {}
    for (const lang of LANGS) {
      const v = overlays[lang].cellSummaries?.[key]
      if (v) summary[lang] = v
    }
    return {
      topicId: cell.topicId,
      partyId: cell.partyId,
      stance: cell.stance,
      summary,
      ...(cell.sources?.length ? { sources: cell.sources } : {}),
    }
  })

  const assembled = { parties, topics, cells }
  fs.writeFileSync(OUT, `${JSON.stringify(assembled)}\n`)
  console.log(`Wrote ${OUT} (${fs.statSync(OUT).size} bytes)`)
}

main()
