/** Berlin Abgeordnetenhaus election date (local calendar day). */
export const ELECTION_DATE = "2026-09-20"

/** Polling stations close (Europe/Berlin). Media feed unlocks after this. */
export const ELECTION_POLLS_CLOSE_HOUR = 18

export const ELECTION_DATE_DISPLAY = {
  en: "20 September 2026",
  de: "20. September 2026",
} as const

/**
 * True once election day polls have closed in Berlin.
 * Media coverage starts only after this moment.
 */
export function isElectionEnded(now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  const ymd = `${get("year")}-${get("month")}-${get("day")}`
  if (ymd > ELECTION_DATE) return true
  if (ymd < ELECTION_DATE) return false

  const hour = Number.parseInt(get("hour"), 10)
  return Number.isFinite(hour) && hour >= ELECTION_POLLS_CLOSE_HOUR
}
