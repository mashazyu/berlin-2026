/** Edit these URLs when profiles change. */
export type PersonContact = {
  id: "nina" | "masha"
  email: string
  linkedin: string
  substack: string
}

/** Shared inbox for the collective contact CTA. */
export const COLLECTIVE_EMAIL = "feedback@berlin-2026.de"

export const PEOPLE: PersonContact[] = [
  {
    id: "nina",
    email: "feedback@berlin-2026.de",
    linkedin: "",
    substack: "",
  },
  {
    id: "masha",
    email: "feedback@berlin-2026.de",
    linkedin: "",
    substack: "",
  },
]
