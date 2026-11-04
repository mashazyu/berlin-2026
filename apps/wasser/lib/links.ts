/** Kompass Kollektive — about / team lives here, not on Wasser-Kompass. */
export const KOMPASS_HOME = "https://kompass.berlin"
export const KOMPASS_ABOUT = "https://kompass.berlin/de#about"

export function kompassAboutHref(language: string): string {
  if (language === "en") return "https://kompass.berlin/en#about"
  if (language === "ru") return "https://kompass.berlin/ru#about"
  return KOMPASS_ABOUT
}
