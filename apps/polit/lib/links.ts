import type { Language } from "@/lib/i18n"

const GUIDE_BASE = "https://www.water4all.com.de"

/** Water for All fountain request guide (language-aware). */
export function guideHref(language: Language): string {
  if (language === "de") return `${GUIDE_BASE}/de/fountains/guide`
  if (language === "ru") return `${GUIDE_BASE}/ru/fountains/guide`
  return `${GUIDE_BASE}/en/fountains/guide`
}

export const KOMPASS_HOME = "https://kompass.berlin"
