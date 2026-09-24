import type { Language } from "@/lib/i18n"

export type ProjectId = "water4all" | "berlin-2026" | "polit"

const WATER_BASE = "https://www.water4all.com.de"
const WAHL_BASE = "https://www.berlin-2026.de"
const POLIT_BASE = "https://polit.kompass.berlin"

export function projectHref(id: ProjectId, language: Language): string {
  if (id === "water4all") {
    if (language === "de") return `${WATER_BASE}/de`
    if (language === "ru") return `${WATER_BASE}/ru`
    return WATER_BASE
  }

  if (id === "polit") {
    return `${POLIT_BASE}/${language}`
  }

  return `${WAHL_BASE}/${language}`
}
