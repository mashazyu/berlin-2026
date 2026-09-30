/**
 * Encodes EN + DE + RU Notion full comparison tables into data/comparison.json
 * Sources: agent-tools scrapes of Nina Harz Notion pages (51 topics × 10 parties).
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const EN_SRC =
  "/Users/maria/.cursor/projects/Users-maria-fun-berlin-2026/agent-tools/b64c5f38-bd24-48cb-abba-ff49d39b8f68.txt"
const DE_SRC =
  "/Users/maria/.cursor/projects/Users-maria-fun-berlin-2026/agent-tools/fd6d007d-c4ee-4343-900a-bda5098b54d7.txt"
const RU_SRC =
  "/Users/maria/.cursor/projects/Users-maria-fun-berlin-2026/agent-tools/dc248330-5b31-48b6-be62-2a99db9f520a.txt"

const PARTY_ORDER = [
  "cdu",
  "spd",
  "gruene",
  "linke",
  "fdp",
  "afd",
  "bsw",
  "volt",
  "tierschutz",
  "oedp",
]

const SHORT = {
  cdu: "CDU",
  spd: "SPD",
  gruene: "Grüne",
  linke: "Linke",
  fdp: "FDP",
  afd: "AfD",
  bsw: "BSW",
  volt: "Volt",
  tierschutz: "Tierschutz",
  oedp: "ÖDP",
}

/** @type {Record<string, string>} */
const NAME_DE = {
  cdu: "CDU",
  spd: "SPD",
  gruene: "Bündnis 90/Die Grünen",
  linke: "Die Linke",
  fdp: "FDP",
  afd: "AfD",
  bsw: "BSW",
  volt: "Volt",
  tierschutz: "Tierschutzpartei",
  oedp: "ÖDP Berlin",
}

function slugify(label) {
  return label
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72)
}

function inferGroup(enLabel) {
  const t = enLabel.toLowerCase()
  if (t.startsWith("public transport") || t.startsWith("road and") || t.includes("ber airport") || t.includes("parking"))
    return "transport"
  if (t.startsWith("cleanliness") || t.includes("waste") || t.includes("bsr"))
    return "waste"
  if (t.startsWith("environment") || t.includes("climate") || t.includes("energy"))
    return "climate_energy"
  if (t.startsWith("animal"))
    return "animals"
  if (t.startsWith("housing") || t.includes("tempelhof"))
    return "housing"
  if (t.startsWith("security"))
    return "security"
  if (t.startsWith("kitas") || t.startsWith("schools") || t.includes("education") || t.includes("vocational") || t.includes("higher education") || t.includes("continuing") || t.includes("shortage of qualified"))
    return "education"
  if (t.startsWith("healthcare") || t.startsWith("care ") || t.startsWith("drug"))
    return "health"
  if (t.startsWith("migration"))
    return "migration"
  if (t.startsWith("economy") || t.startsWith("innovation") || t.startsWith("business") || t.startsWith("small business") || t.startsWith("taxes"))
    return "economy"
  if (t.startsWith("ban on firecrackers") || t.includes("fireworks"))
    return "society"
  if (t.startsWith("governance") || t.startsWith("digitalization") || t.startsWith("social") || t.startsWith("culture") || t.startsWith("sports"))
    return "society"
  if (t.startsWith("democracy") || t.startsWith("women") || t.startsWith("queer") || t.startsWith("elections") || t.startsWith("party donations") || t.startsWith("advertising"))
    return "democracy"
  return "other"
}

function splitRow(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith("|")) return null
  return trimmed.split("|").slice(1, -1).map((c) => c.trim())
}

function isSeparatorRow(parts) {
  return parts.every((p) => /^[-:]+$/.test(p.replace(/\s/g, "")))
}

function parseHeaderLink(cell) {
  const m = cell.match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (!m) return { name: cell.replace(/\s+/g, " ").trim(), url: "" }
  return { name: m[1].replace(/\s+/g, " ").trim(), url: m[2].replace(/\\_/g, "_") }
}

function parseStance(text) {
  const t = text.trim()
  if (!t) return { stance: "none", summary: "" }
  if (t.startsWith("✓")) {
    return { stance: "for", summary: t.replace(/^✓\s*/, "").trim() }
  }
  if (t.startsWith("✗")) {
    return { stance: "against", summary: t.replace(/^✗\s*/, "").trim() }
  }
  if (t.startsWith("≈")) {
    return { stance: "mixed", summary: t.replace(/^≈\s*/, "").trim() }
  }
  return { stance: "mixed", summary: t }
}

function parseTable(markdown) {
  const lines = markdown.split("\n")
  let header = null
  const rows = []

  for (const line of lines) {
    const parts = splitRow(line)
    if (!parts || parts.length < 2) continue
    if (isSeparatorRow(parts)) continue
    if (!header) {
      header = parts
      continue
    }
    if (parts.length < header.length - 2) break
    rows.push(parts)
  }

  if (!header) throw new Error("No table header found")

  const parties = header.slice(1).map((cell, i) => {
    const { name, url } = parseHeaderLink(cell)
    return { id: PARTY_ORDER[i], name, url }
  })

  const topics = []
  const cells = []

  rows.forEach((parts, rowIndex) => {
    const topicLabel = parts[0]
    topics.push({ label: topicLabel, sortOrder: rowIndex + 1 })
    for (let i = 0; i < PARTY_ORDER.length; i++) {
      const raw = parts[i + 1] ?? ""
      const { stance, summary } = parseStance(raw)
      cells.push({
        rowIndex,
        partyId: PARTY_ORDER[i],
        stance,
        summary,
      })
    }
  })

  return { parties, topics, cells }
}

function main() {
  const en = parseTable(fs.readFileSync(EN_SRC, "utf8"))
  const de = parseTable(fs.readFileSync(DE_SRC, "utf8"))
  const ru = parseTable(fs.readFileSync(RU_SRC, "utf8"))

  if (en.topics.length !== de.topics.length || en.topics.length !== ru.topics.length) {
    console.warn(
      `Topic count mismatch: EN=${en.topics.length} DE=${de.topics.length} RU=${ru.topics.length}`
    )
  }

  const usedIds = new Set()
  const topics = en.topics.map((topic, i) => {
    let id = slugify(topic.label) || `topic-${i + 1}`
    if (usedIds.has(id)) id = `${id}-${i + 1}`
    usedIds.add(id)
    return {
      id,
      group: inferGroup(topic.label),
      label: {
        en: topic.label,
        de: de.topics[i]?.label ?? null,
        ru: ru.topics[i]?.label ?? null,
      },
      sortOrder: topic.sortOrder,
    }
  })

  const parties = en.parties.map((p, i) => ({
    id: p.id,
    shortName: SHORT[p.id],
    name: {
      en: p.name,
      de: NAME_DE[p.id] ?? de.parties[i]?.name ?? null,
      ru: ru.parties[i]?.name ?? p.name,
    },
    programUrl: p.url || de.parties[i]?.url || ru.parties[i]?.url || "",
  }))

  const deByKey = new Map(
    de.cells.map((c) => [`${c.rowIndex}::${c.partyId}`, c])
  )
  const ruByKey = new Map(
    ru.cells.map((c) => [`${c.rowIndex}::${c.partyId}`, c])
  )

  const cells = en.cells.map((c) => {
    const key = `${c.rowIndex}::${c.partyId}`
    const deCell = deByKey.get(key)
    const ruCell = ruByKey.get(key)
    const topicId = topics[c.rowIndex].id
    return {
      topicId,
      partyId: c.partyId,
      stance: c.stance,
      summary: {
        en: c.summary || "",
        de: deCell?.summary || null,
        ru: ruCell?.summary || null,
      },
    }
  })

  const out = { parties, topics, cells }
  const outPath = path.join(ROOT, "data", "comparison.json")
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n")
  console.log(
    `Wrote ${outPath}: ${parties.length} parties, ${topics.length} topics, ${cells.length} cells`
  )
}

main()
