import { MEDIA_FEEDS, type MediaFeed } from "@/lib/media/feeds"
import {
  BERLIN_KEYWORDS,
  INSTITUTION_KEYWORDS,
  PARTY_KEYWORDS,
  matchTopicGroups,
  matchesAny,
  normalizeText,
} from "@/lib/media/keywords"
import type { MediaListFilters } from "@/lib/media/query"
import type { MediaFetchResult, MediaItem } from "@/lib/media/types"
import { isElectionEnded } from "@/lib/seo/election"

const FETCH_TIMEOUT_MS = 12_000
const USER_AGENT =
  "Mozilla/5.0 (compatible; WahlKompassMediaBot/1.0; +https://wahl.kompass.berlin)"

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
      String.fromCharCode(Number.parseInt(n, 16))
    )
    .trim()
}

function tagContent(block: string, tag: string): string {
  const re = new RegExp(
    `<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  )
  const match = block.match(re)
  return match ? decodeXmlEntities(match[1]) : ""
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parseRssItems(xml: string): {
  title: string
  link: string
  date: string
  summary: string
}[] {
  const items: {
    title: string
    link: string
    date: string
    summary: string
  }[] = []
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []
  for (const block of blocks) {
    const title = tagContent(block, "title")
    let link = tagContent(block, "link")
    if (!link) {
      const atom = block.match(/<link[^>]*href=["']([^"']+)["']/i)
      link = atom?.[1] ?? ""
    }
    const date =
      tagContent(block, "pubDate") ||
      tagContent(block, "published") ||
      tagContent(block, "updated") ||
      tagContent(block, "dc:date")
    const summaryRaw =
      tagContent(block, "description") ||
      tagContent(block, "summary") ||
      tagContent(block, "content:encoded") ||
      tagContent(block, "content")
    const summary = stripHtml(summaryRaw)
    if (title && link) items.push({ title, link, date, summary })
  }
  return items
}

function toIsoDate(raw: string): string | null {
  if (!raw) return null
  const ms = Date.parse(raw)
  if (Number.isNaN(ms)) return null
  return new Date(ms).toISOString()
}

function scoreItem(input: {
  partyHits: string[]
  institutionHits: string[]
  topicHits: string[]
  berlinHit: boolean
  scope: MediaFeed["scope"]
  hasSummary: boolean
}): number {
  let score = 0
  score += input.partyHits.length * 3
  score += input.institutionHits.length * 2
  score += input.topicHits.length * 2
  if (input.berlinHit) score += 2
  if (input.scope === "berlin" && input.berlinHit) score += 1
  if (input.hasSummary) score += 1
  return score
}

function relevant(item: {
  partyHits: string[]
  institutionHits: string[]
  berlinHit: boolean
  scope: MediaFeed["scope"]
}): boolean {
  // Must mention a seated party OR a core institution.
  if (item.partyHits.length === 0 && item.institutionHits.length === 0) {
    return false
  }
  // Berlin feeds: party alone is enough (local politics).
  if (item.scope === "berlin") return true
  // National feeds: prefer party + politics/institution, or clear Berlin angle.
  return (
    item.institutionHits.length > 0 ||
    item.berlinHit ||
    item.partyHits.length >= 1
  )
}

async function fetchFeedXml(feed: MediaFeed): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(feed.url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": USER_AGENT,
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const text = await response.text()
    if (text.includes("_centinel") || text.trimStart().startsWith("<script")) {
      throw new Error("Bot challenge page instead of RSS")
    }
    return text
  } finally {
    clearTimeout(timer)
  }
}

function dedupeKey(title: string, source: string): string {
  return `${source}::${normalizeText(title).replace(/\s+/g, " ").slice(0, 120)}`
}

function sortMediaItems(items: MediaItem[]): MediaItem[] {
  return [...items].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const da = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const db = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return db - da
  })
}

/** Live RSS pull — all matched items (no display cap). */
export async function collectLiveMediaItems(): Promise<{
  items: MediaItem[]
  feedErrors: MediaFetchResult["feedErrors"]
  fetchedAt: string
}> {
  const fetchedAt = new Date().toISOString()
  const feedErrors: MediaFetchResult["feedErrors"] = []
  const collected: MediaItem[] = []
  const seen = new Set<string>()

  // Prefer Inland over general Politik for FAZ — skip politik if inland succeeds.
  let fazInlandOk = false

  const results = await Promise.all(
    MEDIA_FEEDS.map(async (feed) => {
      try {
        const xml = await fetchFeedXml(feed)
        return { feed, xml, error: null as string | null }
      } catch (error) {
        return {
          feed,
          xml: null as string | null,
          error: error instanceof Error ? error.message : String(error),
        }
      }
    })
  )

  for (const result of results) {
    if (!result.error && result.feed.id === "faz-inland") fazInlandOk = true
  }

  for (const result of results) {
    const { feed, xml, error } = result
    if (error || !xml) {
      feedErrors.push({
        feedId: feed.id,
        source: feed.source,
        message: error ?? "Empty feed",
      })
      continue
    }

    if (feed.id === "faz-politik" && fazInlandOk) continue

    try {
      for (const raw of parseRssItems(xml)) {
        const summary =
          raw.summary &&
          normalizeText(raw.summary) !== normalizeText(raw.title)
            ? raw.summary.slice(0, 600)
            : ""
        // Scan title + summary only — URLs create false keyword hits.
        const textHaystack = normalizeText(
          summary ? `${raw.title} ${summary}` : raw.title
        )
        const partyHits = matchesAny(textHaystack, PARTY_KEYWORDS)
        const institutionHits = matchesAny(textHaystack, INSTITUTION_KEYWORDS)
        const topicHits = matchTopicGroups(textHaystack)
        const berlinHit = matchesAny(textHaystack, BERLIN_KEYWORDS).length > 0
        const meta = {
          partyHits,
          institutionHits,
          berlinHit,
          scope: feed.scope,
        }
        if (!relevant(meta)) continue

        const key = dedupeKey(raw.title, feed.source)
        if (seen.has(key)) continue
        seen.add(key)

        const idHash = raw.link
          .replace(/^https?:\/\//, "")
          .replace(/[^a-zA-Z0-9]+/g, "")
          .slice(-28)

        collected.push({
          id: `${feed.id}-${idHash}`,
          title: raw.title,
          summary: summary || null,
          url: raw.link,
          publishedAt: toIsoDate(raw.date),
          source: feed.source,
          lean: feed.lean,
          scope: feed.scope,
          feedId: feed.id,
          partyHits,
          institutionHits,
          topicHits,
          berlinHit,
          score: scoreItem({
            ...meta,
            topicHits,
            hasSummary: Boolean(summary),
          }),
        })
      }
    } catch (parseError) {
      feedErrors.push({
        feedId: feed.id,
        source: feed.source,
        message:
          parseError instanceof Error ? parseError.message : String(parseError),
      })
    }
  }

  return {
    items: sortMediaItems(collected),
    feedErrors,
    fetchedAt,
  }
}

/**
 * Cron / manual ingest: pull RSS and upsert into the persistent archive.
 */
export async function ingestMediaArchive(): Promise<{
  active: boolean
  total: number
  added: number
  backend: "postgres" | "local" | null
  feedErrors: MediaFetchResult["feedErrors"]
  fetchedAt: string
}> {
  const fetchedAt = new Date().toISOString()
  if (!isElectionEnded()) {
    return {
      active: false,
      total: 0,
      added: 0,
      backend: null,
      feedErrors: [],
      fetchedAt,
    }
  }

  const { upsertMediaArchive } = await import("@/lib/media/archive")
  const live = await collectLiveMediaItems()
  const saved = await upsertMediaArchive(live.items, live.fetchedAt)
  return {
    active: true,
    total: saved.total,
    added: saved.added,
    backend: saved.backend,
    feedErrors: live.feedErrors,
    fetchedAt: live.fetchedAt,
  }
}

/** Default SSR / first-paint filters (Berlin tab, UI defaults). */
export function defaultMediaListFilters(): MediaListFilters {
  const sources = [
    ...new Set(
      MEDIA_FEEDS.filter((feed) => feed.scope === "berlin").map(
        (feed) => feed.source
      )
    ),
  ]
  return {
    scope: "berlin",
    sources,
    partyKeywords: "all",
    topics: "all",
    time: "since_election",
  }
}

/**
 * Page load: first page of the archive (newest 20).
 * If empty (first deploy), seed once from live RSS.
 * Regular growth comes from `/api/media/ingest` (Vercel Cron).
 */
export async function fetchMediaCoverage(): Promise<MediaFetchResult> {
  const fetchedAt = new Date().toISOString()

  if (!isElectionEnded()) {
    return {
      active: false,
      items: [],
      nextCursor: null,
      total: 0,
      fetchedAt,
      feedErrors: [],
    }
  }

  const { loadMediaArchive, upsertMediaArchive } = await import(
    "@/lib/media/archive"
  )
  const { queryMediaItems, MEDIA_PAGE_SIZE } = await import(
    "@/lib/media/query"
  )

  const archive = await loadMediaArchive()
  let feedErrors: MediaFetchResult["feedErrors"] = []

  if (!archive || archive.items.length === 0) {
    const live = await collectLiveMediaItems()
    feedErrors = live.feedErrors
    try {
      await upsertMediaArchive(live.items, live.fetchedAt)
    } catch {
      // Fall through — query may still be empty; client shows empty state.
    }
  }

  const page = await queryMediaItems({
    filters: defaultMediaListFilters(),
    limit: MEDIA_PAGE_SIZE,
  })

  return {
    active: page.active,
    items: page.items,
    nextCursor: page.nextCursor,
    total: page.total,
    fetchedAt: page.fetchedAt || fetchedAt,
    feedErrors,
  }
}
