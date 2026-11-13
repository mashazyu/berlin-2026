import { MEDIA_FEEDS, type MediaFeed } from "@/lib/media/feeds"
import {
  BERLIN_KEYWORDS,
  INSTITUTION_KEYWORDS,
  PARTY_KEYWORDS,
  matchesAny,
  normalizeText,
} from "@/lib/media/keywords"
import type { MediaFetchResult, MediaItem } from "@/lib/media/types"

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

function parseRssItems(xml: string): { title: string; link: string; date: string }[] {
  const items: { title: string; link: string; date: string }[] = []
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
    if (title && link) items.push({ title, link, date })
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
  berlinHit: boolean
  scope: MediaFeed["scope"]
}): number {
  let score = 0
  score += input.partyHits.length * 3
  score += input.institutionHits.length * 2
  if (input.berlinHit) score += 2
  if (input.scope === "berlin" && input.berlinHit) score += 1
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
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 1800 },
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

export async function fetchMediaCoverage(): Promise<MediaFetchResult> {
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
        const haystack = normalizeText(`${raw.title} ${raw.link}`)
        const partyHits = matchesAny(haystack, PARTY_KEYWORDS)
        const institutionHits = matchesAny(haystack, INSTITUTION_KEYWORDS)
        const berlinHit = matchesAny(haystack, BERLIN_KEYWORDS).length > 0
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
          url: raw.link,
          publishedAt: toIsoDate(raw.date),
          source: feed.source,
          lean: feed.lean,
          scope: feed.scope,
          feedId: feed.id,
          partyHits,
          institutionHits,
          berlinHit,
          score: scoreItem(meta),
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

  collected.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const da = a.publishedAt ? Date.parse(a.publishedAt) : 0
    const db = b.publishedAt ? Date.parse(b.publishedAt) : 0
    return db - da
  })

  return {
    items: collected.slice(0, 80),
    fetchedAt: new Date().toISOString(),
    feedErrors,
  }
}
