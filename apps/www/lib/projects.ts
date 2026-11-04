import type { Language } from "@/lib/i18n"

export type ProjectId = "water4all" | "berlin-2026" | "polit"

const WATER_BASE = "https://www.water4all.com.de"
const WAHL_BASE = "https://www.berlin-2026.de"

const PROGRAM_HREF: Partial<Record<ProjectId, string>> = {
  water4all: "https://www.club-dialog.de/ina/",
  "berlin-2026":
    "https://www.bvre.de/projekte-des-bvre/kommunal-activ.html",
}

/** Live project URL, or null when the site is not ready to link yet. */
export function projectHref(
  id: ProjectId,
  language: Language
): string | null {
  if (id === "water4all") {
    if (language === "de") return `${WATER_BASE}/de`
    if (language === "ru") return `${WATER_BASE}/ru`
    return WATER_BASE
  }

  // Kommunal Kompass site is not ready yet.
  if (id === "polit") return null

  return `${WAHL_BASE}/${language}`
}

/** Supporting programme page, if the project has one. */
export function programHref(id: ProjectId): string | undefined {
  return PROGRAM_HREF[id]
}
