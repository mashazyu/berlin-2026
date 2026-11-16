import { NextResponse } from "next/server"
import { MEDIA_FEEDS, type MediaScope } from "@/lib/media/feeds"
import { MEDIA_TOPIC_GROUPS } from "@/lib/media/keywords"
import {
  MEDIA_PAGE_SIZE,
  MEDIA_PARTY_KEYWORDS,
  partyIdsToKeywords,
  queryMediaItems,
  type MediaTimeFilter,
} from "@/lib/media/query"
import type { TopicGroup } from "@/lib/comparison/types"

export const dynamic = "force-dynamic"

const TIME_FILTERS = new Set<MediaTimeFilter>([
  "all",
  "24h",
  "7d",
  "30d",
  "since_election",
])

function parseScope(raw: string | null): MediaScope {
  return raw === "bund" ? "bund" : "berlin"
}

function parseTime(raw: string | null): MediaTimeFilter {
  if (raw && TIME_FILTERS.has(raw as MediaTimeFilter)) {
    return raw as MediaTimeFilter
  }
  return "since_election"
}

function sourcesForScope(scope: MediaScope): string[] {
  return [
    ...new Set(
      MEDIA_FEEDS.filter((feed) => feed.scope === scope).map(
        (feed) => feed.source
      )
    ),
  ]
}

function parseList(raw: string | null): string[] | null {
  if (raw === null) return null
  if (raw === "") return []
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const scope = parseScope(url.searchParams.get("scope"))
  const time = parseTime(url.searchParams.get("time"))
  const cursor = url.searchParams.get("cursor")
  const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "", 10)
  const limit = Number.isFinite(limitRaw) ? limitRaw : MEDIA_PAGE_SIZE

  const sourcesParam = parseList(url.searchParams.get("sources"))
  const sources = sourcesParam ?? sourcesForScope(scope)

  const partiesParam = parseList(url.searchParams.get("parties"))
  const partyKeywords =
    partiesParam === null
      ? ("all" as const)
      : partyIdsToKeywords(
          partiesParam.filter((id) => id in MEDIA_PARTY_KEYWORDS)
        )

  const topicsParam = parseList(url.searchParams.get("topics"))
  const topicSet = new Set<string>(MEDIA_TOPIC_GROUPS)
  let topics: TopicGroup[] | "all" =
    topicsParam === null
      ? "all"
      : topicsParam.filter((topic): topic is TopicGroup => topicSet.has(topic))

  if (
    topics !== "all" &&
    topics.length === MEDIA_TOPIC_GROUPS.length &&
    MEDIA_TOPIC_GROUPS.every((group) => topics.includes(group))
  ) {
    topics = "all"
  }

  const page = await queryMediaItems({
    filters: {
      scope,
      sources,
      partyKeywords,
      topics,
      time,
    },
    cursor,
    limit,
  })

  return NextResponse.json({
    items: page.items,
    nextCursor: page.nextCursor,
    fetchedAt: page.fetchedAt,
    total: page.total,
    active: page.active,
  })
}
