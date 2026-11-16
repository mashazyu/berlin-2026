import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"
import type { TopicGroup } from "@/lib/comparison/types"
import type { MediaLean, MediaScope } from "@/lib/media/feeds"
import type { MediaItem } from "@/lib/media/types"

export type MediaArchive = {
  updatedAt: string
  items: MediaItem[]
}

export type MediaArchiveBackend = "postgres" | "local"

/** Keep a bit more than a calendar year. */
const RETENTION_DAYS = 400
const PAGE_LOAD_LIMIT = 10_000
const UPSERT_CHUNK = 25

const LOCAL_DIR = path.join(process.cwd(), ".data")
const LOCAL_PATH = path.join(LOCAL_DIR, "media-archive.json")

type Sql = NeonQueryFunction<false, false>

type MediaRow = {
  id: string
  title: string
  summary: string | null
  url: string
  published_at: string | Date | null
  source: string
  lean: string
  scope: string
  feed_id: string
  party_hits: unknown
  institution_hits: unknown
  topic_hits: unknown
  berlin_hit: boolean
  score: number
  updated_at?: string | Date
}

function databaseUrl(): string | undefined {
  const url =
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim()
  return url || undefined
}

export function hasPostgres(): boolean {
  return Boolean(databaseUrl())
}

export function getMediaSql(): Sql {
  return getSql()
}

export async function ensureMediaSchema(sql: Sql = getSql()): Promise<void> {
  await ensureSchema(sql)
}

export { rowToItem as mediaRowToItem, RETENTION_DAYS as MEDIA_RETENTION_DAYS }
export type { MediaRow as MediaArchiveRow, Sql as MediaSql }

function getSql(): Sql {
  const url = databaseUrl()
  if (!url) throw new Error("Missing POSTGRES_URL / DATABASE_URL")
  return neon(url)
}

export function mergeMediaItems(
  existing: MediaItem[],
  incoming: MediaItem[]
): MediaItem[] {
  const byId = new Map<string, MediaItem>()
  for (const item of existing) byId.set(item.id, item)
  for (const item of incoming) {
    const prev = byId.get(item.id)
    if (!prev || item.score >= prev.score) {
      byId.set(item.id, item)
    }
  }
  return [...byId.values()].sort(compareMediaItems)
}

function compareMediaItems(a: MediaItem, b: MediaItem): number {
  if (b.score !== a.score) return b.score - a.score
  const da = a.publishedAt ? Date.parse(a.publishedAt) : 0
  const db = b.publishedAt ? Date.parse(b.publishedAt) : 0
  return db - da
}

function toIso(value: string | Date | null | undefined): string | null {
  if (!value) return null
  if (value instanceof Date) return value.toISOString()
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? null : new Date(ms).toISOString()
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string")
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown
      return asStringArray(parsed)
    } catch {
      return []
    }
  }
  return []
}

function rowToItem(row: MediaRow): MediaItem {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    url: row.url,
    publishedAt: toIso(row.published_at),
    source: row.source,
    lean: row.lean as MediaLean,
    scope: row.scope as MediaScope,
    feedId: row.feed_id,
    partyHits: asStringArray(row.party_hits),
    institutionHits: asStringArray(row.institution_hits),
    topicHits: asStringArray(row.topic_hits) as TopicGroup[],
    berlinHit: Boolean(row.berlin_hit),
    score: Number(row.score) || 0,
  }
}

async function ensureSchema(sql: Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS media_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT,
      url TEXT NOT NULL,
      published_at TIMESTAMPTZ,
      source TEXT NOT NULL,
      lean TEXT NOT NULL,
      scope TEXT NOT NULL,
      feed_id TEXT NOT NULL,
      party_hits JSONB NOT NULL DEFAULT '[]'::jsonb,
      institution_hits JSONB NOT NULL DEFAULT '[]'::jsonb,
      topic_hits JSONB NOT NULL DEFAULT '[]'::jsonb,
      berlin_hit BOOLEAN NOT NULL DEFAULT FALSE,
      score INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS media_items_published_at_idx
    ON media_items (published_at DESC NULLS LAST)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS media_items_scope_idx
    ON media_items (scope)
  `
  await sql`
    CREATE INDEX IF NOT EXISTS media_items_source_idx
    ON media_items (source)
  `
}

async function pruneOldRows(sql: Sql): Promise<void> {
  await sql`
    DELETE FROM media_items
    WHERE COALESCE(published_at, updated_at)
      < NOW() - make_interval(days => ${RETENTION_DAYS})
  `
}

async function countPostgresItems(sql: Sql): Promise<number> {
  const rows = await sql`
    SELECT COUNT(*)::int AS count
    FROM media_items
    WHERE COALESCE(published_at, updated_at)
      >= NOW() - make_interval(days => ${RETENTION_DAYS})
  `
  return Number(rows[0]?.count ?? 0)
}

async function loadPostgresArchive(): Promise<MediaArchive | null> {
  const sql = getSql()
  await ensureSchema(sql)
  const rows = (await sql`
    SELECT
      id, title, summary, url, published_at, source, lean, scope, feed_id,
      party_hits, institution_hits, topic_hits, berlin_hit, score, updated_at
    FROM media_items
    WHERE COALESCE(published_at, updated_at)
      >= NOW() - make_interval(days => ${RETENTION_DAYS})
    ORDER BY score DESC, published_at DESC NULLS LAST
    LIMIT ${PAGE_LOAD_LIMIT}
  `) as MediaRow[]

  if (!rows.length) return null

  const latest = rows.reduce<string>((max, row) => {
    const iso = toIso(row.updated_at) ?? toIso(row.published_at) ?? max
    return iso > max ? iso : max
  }, new Date(0).toISOString())

  return {
    updatedAt: latest,
    items: rows.map(rowToItem),
  }
}

async function upsertPostgresItems(
  sql: Sql,
  incoming: MediaItem[]
): Promise<{ added: number; total: number }> {
  await ensureSchema(sql)
  const before = await countPostgresItems(sql)

  for (let i = 0; i < incoming.length; i += UPSERT_CHUNK) {
    const chunk = incoming.slice(i, i + UPSERT_CHUNK)
    await Promise.all(
      chunk.map((item) =>
        sql`
          INSERT INTO media_items (
            id, title, summary, url, published_at, source, lean, scope, feed_id,
            party_hits, institution_hits, topic_hits, berlin_hit, score, updated_at
          )
          VALUES (
            ${item.id},
            ${item.title},
            ${item.summary},
            ${item.url},
            ${item.publishedAt},
            ${item.source},
            ${item.lean},
            ${item.scope},
            ${item.feedId},
            ${JSON.stringify(item.partyHits)}::jsonb,
            ${JSON.stringify(item.institutionHits)}::jsonb,
            ${JSON.stringify(item.topicHits)}::jsonb,
            ${item.berlinHit},
            ${item.score},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            url = EXCLUDED.url,
            published_at = COALESCE(EXCLUDED.published_at, media_items.published_at),
            source = EXCLUDED.source,
            lean = EXCLUDED.lean,
            scope = EXCLUDED.scope,
            feed_id = EXCLUDED.feed_id,
            party_hits = EXCLUDED.party_hits,
            institution_hits = EXCLUDED.institution_hits,
            topic_hits = EXCLUDED.topic_hits,
            berlin_hit = EXCLUDED.berlin_hit,
            score = GREATEST(media_items.score, EXCLUDED.score),
            updated_at = NOW()
        `
      )
    )
  }

  await pruneOldRows(sql)
  const total = await countPostgresItems(sql)
  return { added: Math.max(0, total - before), total }
}

async function loadLocalArchive(): Promise<MediaArchive | null> {
  try {
    const raw = await readFile(LOCAL_PATH, "utf8")
    const parsed = JSON.parse(raw) as MediaArchive
    if (!parsed || !Array.isArray(parsed.items)) return null
    const cutoff = Date.now() - RETENTION_DAYS * 86_400_000
    const items = parsed.items.filter((item) => {
      if (!item.publishedAt) return true
      const ms = Date.parse(item.publishedAt)
      return Number.isNaN(ms) || ms >= cutoff
    })
    return {
      updatedAt: parsed.updatedAt || new Date(0).toISOString(),
      items,
    }
  } catch {
    return null
  }
}

/** Local JSON archive items for in-process filtering/pagination. */
export async function loadLocalArchiveItems(): Promise<MediaArchive> {
  return (
    (await loadLocalArchive()) ?? {
      updatedAt: new Date(0).toISOString(),
      items: [],
    }
  )
}

async function saveLocalArchive(archive: MediaArchive): Promise<void> {
  await mkdir(LOCAL_DIR, { recursive: true })
  await writeFile(LOCAL_PATH, JSON.stringify(archive), "utf8")
}

/** Load persisted archive (Postgres in prod, local file without DB URL). */
export async function loadMediaArchive(): Promise<MediaArchive | null> {
  if (hasPostgres()) {
    return loadPostgresArchive()
  }
  return loadLocalArchive()
}

export async function upsertMediaArchive(
  incoming: MediaItem[],
  updatedAt = new Date().toISOString()
): Promise<
  MediaArchive & {
    backend: MediaArchiveBackend
    added: number
    total: number
  }
> {
  if (hasPostgres()) {
    const sql = getSql()
    const { added, total } = await upsertPostgresItems(sql, incoming)
    const archive = await loadPostgresArchive()
    return {
      updatedAt,
      items: archive?.items ?? incoming.slice().sort(compareMediaItems),
      backend: "postgres",
      added,
      total,
    }
  }

  const previous = (await loadLocalArchive()) ?? { updatedAt, items: [] }
  const before = previous.items.length
  const items = mergeMediaItems(previous.items, incoming)
  const archive: MediaArchive = { updatedAt, items }
  await saveLocalArchive(archive)
  return {
    ...archive,
    backend: "local",
    added: Math.max(0, items.length - before),
    total: items.length,
  }
}
