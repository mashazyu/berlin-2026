/** Edit these URLs when profiles change. */
export type PersonContact = {
  id: "nina" | "masha"
  email: string
  linkedin: string
  substack: string
  /** Public path under /public, e.g. /team/masha.png */
  photo?: string
}

/** Shared inbox for the collective contact CTA. */
export const COLLECTIVE_EMAIL = "feedback@berlin-2026.de"

export const PEOPLE: PersonContact[] = [
  {
    id: "nina",
    email: "",
    linkedin: "",
    substack: "https://substack.com/@ninaharz",
    photo: "/team/nina.png",
  },
  {
    id: "masha",
    email: "",
    linkedin: "https://www.linkedin.com/in/maria-w-722667/",
    substack: "",
    photo: "/team/masha.png",
  },
]
