const META_DESCRIPTION_MAX = 160

export function metaDescription(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim()
  if ([...cleaned].length <= META_DESCRIPTION_MAX) return cleaned
  const truncated = [...cleaned].slice(0, META_DESCRIPTION_MAX - 1).join("")
  const lastSpace = truncated.lastIndexOf(" ")
  const cut = lastSpace > 80 ? truncated.slice(0, lastSpace) : truncated
  return `${cut}…`
}
