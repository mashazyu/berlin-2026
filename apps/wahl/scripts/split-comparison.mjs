/**
 * Split data/comparison.json into:
 *   data/comparison/base.json  — language-agnostic structure + sources
 *   data/comparison/{lang}.json — party names, topic labels, cell summaries
 *
 * Run once when migrating; re-run after editing the monolith if you still have one.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const SRC = path.join(ROOT, "data", "comparison.json")
const OUT_DIR = path.join(ROOT, "data", "comparison")

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

function pickLang(localized, lang) {
  if (localized == null) return ""
  if (typeof localized === "string") return localized
  const v = localized[lang]
  if (v != null && String(v).trim() !== "" && String(v).trim().toUpperCase() !== "TODO") {
    return String(v)
  }
  return ""
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`Missing ${SRC}`)
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(SRC, "utf8"))
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const base = {
    parties: data.parties.map((p) => ({
      id: p.id,
      shortName: p.shortName,
      programUrl: p.programUrl,
    })),
    topics: data.topics.map((t) => ({
      id: t.id,
      group: t.group,
      sortOrder: t.sortOrder,
    })),
    cells: data.cells.map((c) => ({
      topicId: c.topicId,
      partyId: c.partyId,
      stance: c.stance,
      ...(c.sources?.length ? { sources: c.sources } : {}),
    })),
  }

  fs.writeFileSync(path.join(OUT_DIR, "base.json"), `${JSON.stringify(base)}\n`)

  for (const lang of LANGS) {
    const overlay = {
      lang,
      partyNames: Object.fromEntries(
        data.parties.map((p) => [p.id, pickLang(p.name, lang) || p.shortName]),
      ),
      topicLabels: Object.fromEntries(
        data.topics.map((t) => [t.id, pickLang(t.label, lang)]),
      ),
      cellSummaries: Object.fromEntries(
        data.cells.map((c) => [
          `${c.topicId}::${c.partyId}`,
          pickLang(c.summary, lang),
        ]),
      ),
    }
    fs.writeFileSync(
      path.join(OUT_DIR, `${lang}.json`),
      `${JSON.stringify(overlay)}\n`,
    )
  }

  const baseBytes = fs.statSync(path.join(OUT_DIR, "base.json")).size
  console.log(`Wrote ${OUT_DIR}/base.json (${baseBytes} bytes)`)
  for (const lang of LANGS) {
    const n = fs.statSync(path.join(OUT_DIR, `${lang}.json`)).size
    console.log(`  ${lang}.json (${n} bytes)`)
  }
}

main()
