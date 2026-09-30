import type { CellSource } from "./types"

/** Base PDF URL with optional `#page=N` fragment for deep links. */
export function sourceHref(source: Pick<CellSource, "url" | "page">): string {
  const base = source.url.split("#")[0]
  if (source.page != null && source.page > 0) {
    return `${base}#page=${source.page}`
  }
  return base
}

/** Prefer the first claim source with a page; otherwise fall back. */
export function bestProgramHref(
  sources: CellSource[] | undefined,
  fallbackUrl: string,
): string {
  const withPage = sources?.find((s) => s.page != null && s.page > 0)
  if (withPage) return sourceHref(withPage)
  const withUrl = sources?.find((s) => s.url)
  if (withUrl) return sourceHref(withUrl)
  return fallbackUrl
}
