import type { TopicGroup } from "@/lib/comparison/types"
import type { MediaLean, MediaScope } from "@/lib/media/feeds"

export type MediaItem = {
  id: string
  title: string
  /** Plain-text RSS description/summary when the feed provides one. */
  summary: string | null
  url: string
  publishedAt: string | null
  source: string
  lean: MediaLean
  scope: MediaScope
  feedId: string
  partyHits: string[]
  institutionHits: string[]
  topicHits: TopicGroup[]
  berlinHit: boolean
  score: number
}

export type MediaFetchResult = {
  /** False before polls close — no RSS ingest yet. */
  active: boolean
  items: MediaItem[]
  fetchedAt: string
  feedErrors: { feedId: string; source: string; message: string }[]
}
