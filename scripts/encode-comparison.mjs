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

function extractAnalysis() {
  const L = (en) => ({ en, de: null, ru: null })
  return {
    consensus: [
      {
        id: "consensus-trees",
        title: L('Trees and the “sponge city” have become almost a consensus'),
        body: L(
          "Almost all parties, in one way or another, talk about more trees, care for green spaces, rainwater retention, unsealing surfaces, and greening roofs/facades/courtyards. The difference is not whether trees are needed, but scale, binding force, and funding."
        ),
      },
      {
        id: "consensus-transit",
        title: L("Everyone wants to expand public transport"),
        body: L(
          "Even parties with a more pro-car agenda support expanding U-Bahn/S-Bahn/tram/regional rail. The divide is more about priorities: for some it is part of the transport transition, for others a way to relieve roads and outer districts without restricting cars."
        ),
      },
      {
        id: "consensus-bsr",
        title: L("BSR and waste are a shared urban concern"),
        body: L(
          "Almost everyone promises more cleaning, more frequent BSR neighborhood collection days, better bulky-waste pickup, and more containers/bins/drop-off points. But approaches differ: how often bulky waste is collected and who pays for it; initiatives range from zero waste, repair and reuse to fines, video surveillance, and “waste sheriffs.”"
        ),
      },
      {
        id: "consensus-solar",
        title: L("Solar energy is almost a shared baseline"),
        body: L(
          "Almost everyone recognizes PV as important, but they differ on obligations: CDU/FDP/AfD oppose mandatory installation; Greens/Volt/Animal Protection Party/ÖDP propose more active expansion on public buildings, parking lots, facades, etc."
        ),
      },
    ],
    divides: [
      {
        id: "divide-a100",
        title: L("A100 and new roads are one of the clearest dividing lines"),
        body: L(
          "CDU/FDP/AfD/BSW support continuing the A100 or other major new road projects. SPD/Linke/Greens/Animal Protection Party oppose continuing the A100; ÖDP also leans toward reducing car traffic and environmentally assessing projects."
        ),
      },
      {
        id: "divide-tempelhof",
        title: L("Tempelhofer Feld — a conflict over development"),
        body: L(
          "CDU and FDP support development along the edges of the field, with FDP proposing to start without a new vote. SPD, Linke, Greens, and ÖDP emphasize preserving the field and respecting the referendum; ÖDP offers a compromise on the airport building. Volt sidesteps housing and proposes agrivoltaics and mobile energy storage."
        ),
      },
      {
        id: "divide-parking",
        title: L("Parking: “keep/restore” vs “redistribute space”"),
        body: L(
          "CDU, FDP, AfD, and BSW talk about preserving parking spaces, P+R, neighborhood garages, or opposing the “unnecessary destruction of parking.” Greens, Linke, Volt, and the Animal Protection Party talk more about paid/digital parking, reducing spaces for sidewalks, bike lanes and greenery, and fees based on vehicle size/emissions."
        ),
      },
      {
        id: "divide-gas",
        title: L(
          "The gas network and hydrogen are not just a technical dispute, but a political line"
        ),
        body: L(
          "CDU/BSW/AfD cling more strongly to gas infrastructure or the idea of “reliable alternatives first.” SPD/Linke/Greens/Volt/Animal Protection Party talk about phasing out oil and gas, with Greens and the Animal Protection Party explicitly warning that hydrogen must not become an excuse for keeping gas heating."
        ),
      },
      {
        id: "divide-climate",
        title: L(
          "Climate neutrality: many have the goal, but differ on how binding it is"
        ),
        body: L(
          "SPD, Linke, Greens, Volt, Animal Protection Party, and ÖDP formulate climate neutrality as a goal. CDU and FDP frame it more through “affordability,” “innovation,” and “technology openness.” AfD wants to repeal the Berlin Climate Law; BSW criticizes targets and the CO₂ tax."
        ),
      },
    ],
    partyFeatures: [
      {
        id: "party-afd",
        partyId: "afd",
        title: L("AfD"),
        body: L(
          "The only one of the reviewed programs explicitly in favor of bringing back nuclear energy; plus repealing the Berlin Climate Law, cheap resident parking, restoring parking spaces, video surveillance, and “waste sheriffs.”"
        ),
      },
      {
        id: "party-fdp",
        partyId: "fdp",
        title: L("FDP"),
        body: L(
          "Surprisingly friendly to alternatives to cars: protected bike lanes where routes cannot go through quiet streets, bike streets parallel to arterial roads, P&R hubs, charging, geothermal energy, smart heating grids, and rainwater as a resource. At the same time, they strongly support the A100, new roads, Tempo 50 on key arterial roads, and oppose mandatory solar installation."
        ),
      },
      {
        id: "party-bsw",
        partyId: "bsw",
        title: L("BSW"),
        body: L(
          "An interesting mix: for the A100 and against “activism” for climate targets, yet with a lot about BSR, free bulky-waste pickup, district cleaning teams, trees, the sponge city, and coordination of infrastructure projects."
        ),
      },
      {
        id: "party-volt",
        partyId: "volt",
        title: L("Volt"),
        body: L(
          "A very “techno-urban” program: Berlin-Pay + Kehrenbürger, bidirectional charging, U-Bahn automation, dynamic tariffs, smart grids, Park&Ride, digital parking by size and emissions, and green-blue infrastructure."
        ),
      },
      {
        id: "party-tierschutz",
        partyId: "tierschutz",
        title: L("Animal Protection Party"),
        body: L(
          "Not only about animals: one of the most detailed environmental programs — Zero Waste, 365 km of bike lanes per year, heating fully from renewables by 2035, 8 wind-energy sites, mandatory rainwater concepts, and heat protection that even includes free vegan sunscreen."
        ),
      },
      {
        id: "party-oedp",
        partyId: "oedp",
        title: L("ÖDP"),
        body: L(
          "More ecological principledness: preserve Tempelhofer Feld entirely, coal phase-out by 2030, less car traffic, protection of trees/hedges/water bodies as habitat, and a ban on animal testing."
        ),
      },
      {
        id: "party-gruene",
        partyId: "gruene",
        title: L("Greens"),
        body: L(
          "The most systematic climate logic: climate checks, mandatory action programs when targets are missed, decarbonization of heating, criticism of the gas network, sponge city, Zero Waste, protected bike lanes, and heat protection."
        ),
      },
      {
        id: "party-cdu",
        partyId: "cdu",
        title: L("CDU"),
        body: L(
          "Not “anti-environment,” but rather environmentalism without strict obligations: 1 million trees, rainwater, PV on large roofs, heating grids, charging — but also against solar obligations, against shutting down the gas network, and in favor of the A100, roads, and preserving parking."
        ),
      },
      {
        id: "party-spd",
        partyId: "spd",
        title: L("SPD"),
        body: L(
          "A lot of “urban services”: BSR, free bulky-waste pickup twice a year, trees, mini-parks, drinking fountains, repairing bridges/streets instead of extending the A100, plus a moderately climate-oriented line: “out of oil and gas.”"
        ),
      },
      {
        id: "party-linke",
        partyId: "linke",
        title: L("Die Linke"),
        body: L(
          "Social climate policy: climate neutrality by 2040, a CO₂ budget and sector targets, with emphasis that the transport transition, heating transition, and renovation should not hit people on low incomes."
        ),
      },
    ],
  }
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

  const analysis = extractAnalysis()

  const out = {
    parties,
    topics,
    cells,
    analysis,
  }

  const outPath = path.join(ROOT, "data", "comparison.json")
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n")
  console.log(
    `Wrote ${outPath}: ${parties.length} parties, ${topics.length} topics, ${cells.length} cells, analysis consensus=${analysis.consensus.length} divides=${analysis.divides.length} features=${analysis.partyFeatures.length}`
  )
}

main()
