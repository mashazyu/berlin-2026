/**
 * Encodes EN + RU Notion markdown tables into data/comparison.json
 * Sources: agent-tools scrapes of Nina Harz Notion pages.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const EN_SRC =
  "/Users/maria/.cursor/projects/Users-maria-fun-berlin-2026/agent-tools/cb09712b-83fb-4266-bfa2-aaeafb094144.txt"
const RU_SRC =
  "/Users/maria/.cursor/projects/Users-maria-fun-berlin-2026/agent-tools/a3e40517-c910-44b5-933e-5e29fe2d514b.txt"

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

const TOPIC_META = [
  { id: "climate-neutrality", group: "climate_energy" },
  { id: "a100", group: "transport" },
  { id: "road-construction", group: "transport" },
  { id: "public-transport", group: "transport" },
  { id: "cycling", group: "transport" },
  { id: "parking", group: "transport" },
  { id: "ev-charging", group: "transport" },
  { id: "tempelhofer-feld", group: "public_space" },
  { id: "trees", group: "public_space" },
  { id: "heat-protection", group: "public_space" },
  { id: "sponge-city", group: "public_space" },
  { id: "zero-waste", group: "waste" },
  { id: "bsr", group: "waste" },
  { id: "cleanliness", group: "waste" },
  { id: "solar", group: "climate_energy" },
  { id: "wind", group: "climate_energy" },
  { id: "gas", group: "climate_energy" },
  { id: "hydrogen", group: "climate_energy" },
  { id: "heat-pumps", group: "climate_energy" },
  { id: "heating-networks", group: "climate_energy" },
  { id: "nuclear", group: "climate_energy" },
  { id: "animal-protection", group: "animals" },
]

function splitRow(line) {
  const trimmed = line.trim()
  if (!trimmed.startsWith("|")) return null
  const parts = trimmed.split("|").slice(1, -1).map((c) => c.trim())
  return parts
}

function isSeparatorRow(parts) {
  return parts.every((p) => /^[-:]+$/.test(p.replace(/\s/g, "")))
}

function parseHeaderLink(cell) {
  const m = cell.match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (!m) return { name: cell, url: "" }
  return { name: m[1].trim(), url: m[2].replace(/\\_/g, "_") }
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
    // Stop when we leave the table (short non-table content already filtered)
    if (parts.length < header.length - 2) break
    rows.push(parts)
  }

  if (!header) throw new Error("No table header found")

  const parties = header.slice(1).map((cell, i) => {
    const { name, url } = parseHeaderLink(cell)
    return {
      id: PARTY_ORDER[i],
      name,
      url,
    }
  })

  const topics = []
  const cells = []

  rows.forEach((parts, rowIndex) => {
    const topicLabel = parts[0]
    const meta = TOPIC_META[rowIndex]
    if (!meta) {
      console.warn(`Extra row ${rowIndex}: ${topicLabel}`)
      return
    }
    topics.push({ id: meta.id, group: meta.group, label: topicLabel, sortOrder: rowIndex + 1 })

    for (let i = 0; i < PARTY_ORDER.length; i++) {
      const raw = parts[i + 1] ?? ""
      const { stance, summary } = parseStance(raw)
      cells.push({
        topicId: meta.id,
        partyId: PARTY_ORDER[i],
        stance,
        summary,
      })
    }
  })

  return { parties, topics, cells }
}

function main() {
  const enMd = fs.readFileSync(EN_SRC, "utf8")
  const ruMd = fs.readFileSync(RU_SRC, "utf8")

  const en = parseTable(enMd)
  const ru = parseTable(ruMd)

  if (en.topics.length !== TOPIC_META.length) {
    console.warn(`EN topics: ${en.topics.length}, expected ${TOPIC_META.length}`)
  }
  if (ru.topics.length !== TOPIC_META.length) {
    console.warn(`RU topics: ${ru.topics.length}, expected ${TOPIC_META.length}`)
  }

  const parties = en.parties.map((p, i) => ({
    id: p.id,
    shortName:
      p.id === "gruene"
        ? "Grüne"
        : p.id === "tierschutz"
          ? "Tierschutz"
          : p.id === "oedp"
            ? "ÖDP"
            : p.id === "linke"
              ? "Linke"
              : p.shortName || PARTY_ORDER[i].toUpperCase().replace("GRUENE", "Grüne"),
    name: {
      en: p.name.replace(/\s+/g, " ").trim(),
      ru: ru.parties[i]?.name.replace(/\s+/g, " ").trim() ?? null,
      de: null,
    },
    programUrl: p.url,
  }))

  // Fix short names properly
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
  for (const party of parties) {
    party.shortName = SHORT[party.id]
  }

  const topics = en.topics.map((t, i) => ({
    id: t.id,
    group: t.group,
    sortOrder: t.sortOrder,
    label: {
      en: t.label,
      ru: ru.topics[i]?.label ?? null,
      de: null,
    },
  }))

  const ruCellMap = new Map(
    ru.cells.map((c) => [`${c.topicId}::${c.partyId}`, c])
  )

  const cells = en.cells.map((c) => {
    const ruCell = ruCellMap.get(`${c.topicId}::${c.partyId}`)
    // Prefer EN stance; if EN empty and RU has stance, use RU
    let stance = c.stance
    let enSummary = c.summary
    let ruSummary = ruCell?.summary ?? null
    if (stance === "none" && ruCell && ruCell.stance !== "none") {
      stance = ruCell.stance
      if (!enSummary) enSummary = ruSummary || ""
    }
    return {
      topicId: c.topicId,
      partyId: c.partyId,
      stance,
      summary: {
        en: enSummary || "",
        ru: ruSummary || null,
        de: null,
      },
    }
  })

  const out = {
    parties,
    topics,
    cells,
  }

  const outPath = path.join(ROOT, "data", "comparison.json")
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n")
  console.log(
    `Wrote ${outPath}: ${parties.length} parties, ${topics.length} topics, ${cells.length} cells`
  )
}

main()
