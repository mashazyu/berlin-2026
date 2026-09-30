import type { Language } from "@/lib/i18n"

const GUIDE_BASE = "https://www.water4all.com.de"

/** Water for All fountain request guide (language-aware). */
export function guideHref(language: Language): string {
  const locale = language === "de" ? "de" : language === "uk" ? "ru" : "en"
  return `${GUIDE_BASE}/${locale}/fountains/guide`
}

export const KOMPASS_HOME = "https://kompass.berlin"
