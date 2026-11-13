import type { MediaLean, MediaScope } from "@/lib/media/feeds"

export type MediaItem = {
  id: string
  title: string
  url: string
  publishedAt: string | null
  source: string
  lean: MediaLean
  scope: MediaScope
  feedId: string
  partyHits: string[]
  institutionHits: string[]
  berlinHit: boolean
  score: number
}

export type MediaFetchResult = {
  items: MediaItem[]
  fetchedAt: string
  feedErrors: { feedId: string; source: string; message: string }[]
}
