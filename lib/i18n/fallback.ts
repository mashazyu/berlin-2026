import type { Language, LocalizedString } from "./types"

function isBlank(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed === "" || trimmed.toUpperCase() === "TODO"
  }
  return false
}

/** Deep-merge locale over English; blank / TODO / missing → EN. */
export function deepMergeWithFallback<T>(
  fallback: T,
  overlay: Partial<T> | null | undefined
): T {
  if (overlay == null) return fallback

  if (Array.isArray(fallback)) {
    if (!Array.isArray(overlay) || overlay.length === 0) return fallback
    return overlay.map((item, index) => {
      const base = (fallback as unknown[])[index]
      if (base === undefined) return item
      if (typeof base === "object" && base !== null) {
        return deepMergeWithFallback(base, item)
      }
      return isBlank(item) ? base : item
    }) as T
  }

  if (typeof fallback === "object" && fallback !== null) {
    const result: Record<string, unknown> = {
      ...(fallback as Record<string, unknown>),
    }
    for (const [key, value] of Object.entries(overlay as Record<string, unknown>)) {
      const base = (fallback as Record<string, unknown>)[key]
      if (base !== undefined && typeof base === "object" && base !== null) {
        result[key] = deepMergeWithFallback(base, value as Partial<typeof base>)
      } else if (isBlank(value)) {
        result[key] = base
      } else {
        result[key] = value
      }
    }
    return result as T
  }

  return (isBlank(overlay) ? fallback : overlay) as T
}

export function pickLocalized(
  value: LocalizedString | string | null | undefined,
  lang: Language
): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  const preferred = value[lang]
  if (!isBlank(preferred)) return preferred as string
  return value.en ?? ""
}
