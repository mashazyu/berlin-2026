import type { TopicGroup } from "@/lib/comparison/types"
import {
  ensureMediaSchema,
  getMediaSql,
  hasPostgres,
  loadLocalArchiveItems,
  MEDIA_RETENTION_DAYS,
  mediaRowToItem,
  type MediaArchiveRow,
} from "@/lib/media/archive"
import type { MediaScope } from "@/lib/media/feeds"
import { isElectionEnded, ELECTION_DATE } from "@/lib/seo/election"
import type { MediaItem } from "@/lib/media/types"

export const MEDIA_PAGE_SIZE = 20

export type MediaTimeFilter = "all" | "24h" | "7d" | "30d" | "since_election"

export type MediaListFilters = {
  scope: MediaScope
  sources: string[]
  /** Empty = match nothing; "all" = no party filter. */
  partyKeywords: string[] | "all"
  topics: TopicGroup[] | "all"
  time: MediaTimeFilter
}

export type MediaListPage = {
  active: boolean
  items: MediaItem[]
  nextCursor: string | null
  fetchedAt: string
  total: number
}

type MediaCursor = {
  publishedAt: string | null
  id: string
}

const DAY_MS = 86_400_000
const EPOCH_ISO = "1970-01-01T00:00:00.000Z"

/** Party chip id → keywords stored in party_hits. */
export const MEDIA_PARTY_KEYWORDS: Record<string, string[]> = {
  cdu: ["cdu", "union"],
  spd: ["spd"],
  gruene: ["grune", "grunen", "bundnis 90"],
  linke: ["linke", "die linke"],
  afd: ["afd"],
  bsw: ["bsw", "bundnis sahra"],
  fdp: ["fdp"],
}

export function electionUnlockIso(): string {
  return `${ELECTION_DATE}T16:00:00.000Z` // 18:00 Europe/Berlin CEST
}

export function timeBounds(
  time: MediaTimeFilter,
  nowMs = Date.now()
): { after: string | null; before: string | null } {
  if (time === "all") return { after: null, before: null }
  if (time === "since_election") {
    return { after: electionUnlockIso(), before: null }
  }
  const windowMs =
    time === "24h" ? DAY_MS : time === "7d" ? 7 * DAY_MS : 30 * DAY_MS
  return {
    after: new Date(nowMs - windowMs).toISOString(),
    before: new Date(nowMs).toISOString(),
  }
}

export function encodeMediaCursor(cursor: MediaCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url")
}

export function decodeMediaCursor(
  raw: string | null | undefined
): MediaCursor | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    ) as MediaCursor
    if (!parsed || typeof parsed.id !== "string") return null
    if (parsed.publishedAt !== null && typeof parsed.publishedAt !== "string") {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function partyIdsToKeywords(partyIds: string[]): string[] | "all" {
  const allIds = Object.keys(MEDIA_PARTY_KEYWORDS)
  if (partyIds.length === 0) return []
  if (
    partyIds.length === allIds.length &&
    allIds.every((id) => partyIds.includes(id))
  ) {
    return "all"
  }
  const keywords = new Set<string>()
  for (const id of partyIds) {
    for (const keyword of MEDIA_PARTY_KEYWORDS[id] ?? []) keywords.add(keyword)
  }
  return [...keywords]
}

function cursorSortIso(publishedAt: string | null | undefined): string {
  return publishedAt || EPOCH_ISO
}

function compareNewestFirst(a: MediaItem, b: MediaItem): number {
  const da = a.publishedAt ? Date.parse(a.publishedAt) : 0
  const db = b.publishedAt ? Date.parse(b.publishedAt) : 0
  if (db !== da) return db - da
  return b.id.localeCompare(a.id)
}

function passesFilters(
  item: MediaItem,
  filters: MediaListFilters,
  nowMs: number
): boolean {
  if (item.scope !== filters.scope) return false

  if (filters.sources.length === 0) return false
  if (!filters.sources.includes(item.source)) return false

  const { after, before } = timeBounds(filters.time, nowMs)
  if (after || before) {
    if (!item.publishedAt) return false
    const published = Date.parse(item.publishedAt)
    if (Number.isNaN(published)) return false
    if (after && published < Date.parse(after)) return false
    if (before && published > Date.parse(before)) return false
  }

  if (filters.partyKeywords !== "all") {
    if (filters.partyKeywords.length === 0) return false
    if (
      !filters.partyKeywords.some((keyword) => item.partyHits.includes(keyword))
    ) {
      return false
    }
  }

  if (filters.topics !== "all") {
    if (filters.topics.length === 0) return false
    if (item.topicHits.length === 0) return false
    if (!filters.topics.some((topic) => item.topicHits.includes(topic))) {
      return false
    }
  }

  return true
}

function afterCursor(item: MediaItem, cursor: MediaCursor): boolean {
  const itemMs = Date.parse(cursorSortIso(item.publishedAt))
  const cursorMs = Date.parse(cursorSortIso(cursor.publishedAt))
  if (itemMs !== cursorMs) return itemMs < cursorMs
  return item.id < cursor.id
}

function pageFromItems(
  items: MediaItem[],
  cursor: MediaCursor | null,
  limit: number,
  fetchedAt: string
): MediaListPage {
  const sorted = [...items].sort(compareNewestFirst)
  const start = cursor
    ? sorted.findIndex((item) => afterCursor(item, cursor))
    : 0
  const sliceStart = cursor ? (start < 0 ? sorted.length : start) : 0
  const page = sorted.slice(sliceStart, sliceStart + limit)
  const hasMore = sliceStart + limit < sorted.length
  const last = page[page.length - 1]
  const nextCursor =
    hasMore && last
      ? encodeMediaCursor({ publishedAt: last.publishedAt, id: last.id })
      : null

  return {
    active: true,
    items: page,
    nextCursor,
    fetchedAt,
    total: sorted.length,
  }
}

async function queryPostgresMediaItems(input: {
  filters: MediaListFilters
  cursor: MediaCursor | null
  limit: number
  fetchedAt: string
}): Promise<MediaListPage> {
  const sql = getMediaSql()
  await ensureMediaSchema(sql)

  const { filters, cursor, limit, fetchedAt } = input
  const { after, before } = timeBounds(filters.time)
  const sources = filters.sources
  const partyKeywords =
    filters.partyKeywords === "all" ? null : filters.partyKeywords
  const topics = filters.topics === "all" ? null : filters.topics
  const cursorPublished = cursor ? cursorSortIso(cursor.publishedAt) : null
  const cursorId = cursor?.id ?? null

  if (
    sources.length === 0 ||
    partyKeywords?.length === 0 ||
    topics?.length === 0
  ) {
    return {
      active: true,
      items: [],
      nextCursor: null,
      fetchedAt,
      total: 0,
    }
  }

  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM media_items
    WHERE COALESCE(published_at, updated_at)
      >= NOW() - make_interval(days => ${MEDIA_RETENTION_DAYS})
      AND scope = ${filters.scope}
      AND source = ANY(${sources})
      AND (${after}::timestamptz IS NULL OR published_at >= ${after}::timestamptz)
      AND (${before}::timestamptz IS NULL OR published_at <= ${before}::timestamptz)
      AND (
        ${partyKeywords}::text[] IS NULL
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(party_hits) AS hit
          WHERE hit = ANY(${partyKeywords}::text[])
        )
      )
      AND (
        ${topics}::text[] IS NULL
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(topic_hits) AS hit
          WHERE hit = ANY(${topics}::text[])
        )
      )
  `
  const total = Number(countRows[0]?.count ?? 0)

  const rows = (await sql`
    SELECT
      id, title, summary, url, published_at, source, lean, scope, feed_id,
      party_hits, institution_hits, topic_hits, berlin_hit, score, updated_at
    FROM media_items
    WHERE COALESCE(published_at, updated_at)
      >= NOW() - make_interval(days => ${MEDIA_RETENTION_DAYS})
      AND scope = ${filters.scope}
      AND source = ANY(${sources})
      AND (${after}::timestamptz IS NULL OR published_at >= ${after}::timestamptz)
      AND (${before}::timestamptz IS NULL OR published_at <= ${before}::timestamptz)
      AND (
        ${partyKeywords}::text[] IS NULL
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(party_hits) AS hit
          WHERE hit = ANY(${partyKeywords}::text[])
        )
      )
      AND (
        ${topics}::text[] IS NULL
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(topic_hits) AS hit
          WHERE hit = ANY(${topics}::text[])
        )
      )
      AND (
        ${cursorPublished}::timestamptz IS NULL
        OR (
          COALESCE(published_at, TIMESTAMPTZ 'epoch'), id
        ) < (
          ${cursorPublished}::timestamptz,
          ${cursorId}::text
        )
      )
    ORDER BY COALESCE(published_at, TIMESTAMPTZ 'epoch') DESC, id DESC
    LIMIT ${limit + 1}
  `) as MediaArchiveRow[]

  const pageRows = rows.slice(0, limit)
  const items = pageRows.map(mediaRowToItem)
  const hasMore = rows.length > limit
  const last = items[items.length - 1]
  const nextCursor =
    hasMore && last
      ? encodeMediaCursor({ publishedAt: last.publishedAt, id: last.id })
      : null

  return {
    active: true,
    items,
    nextCursor,
    fetchedAt,
    total,
  }
}

export async function queryMediaItems(input: {
  filters: MediaListFilters
  cursor?: string | null
  limit?: number
}): Promise<MediaListPage> {
  const fetchedAt = new Date().toISOString()
  if (!isElectionEnded()) {
    return {
      active: false,
      items: [],
      nextCursor: null,
      fetchedAt,
      total: 0,
    }
  }

  const limit = Math.min(Math.max(input.limit ?? MEDIA_PAGE_SIZE, 1), 50)
  const cursor = decodeMediaCursor(input.cursor)

  if (hasPostgres()) {
    return queryPostgresMediaItems({
      filters: input.filters,
      cursor,
      limit,
      fetchedAt,
    })
  }

  const archive = await loadLocalArchiveItems()
  const nowMs = Date.now()
  const filtered = archive.items.filter((item) =>
    passesFilters(item, input.filters, nowMs)
  )
  return pageFromItems(
    filtered,
    cursor,
    limit,
    archive.updatedAt || fetchedAt
  )
}
