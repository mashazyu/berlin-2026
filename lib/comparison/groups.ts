import type { TopicGroup } from "@/lib/comparison/types"

/** Display order for topic groups (clusters themes for scanning). */
export const TOPIC_GROUP_ORDER: TopicGroup[] = [
  "transport",
  "climate_energy",
  "waste",
  "animals",
  "housing",
  "security",
  "education",
  "health",
  "migration",
  "economy",
  "society",
  "democracy",
  "other",
]

export type TopicGroupBucket<T extends { group: TopicGroup; sortOrder: number }> = {
  group: TopicGroup
  topics: T[]
}

export function groupTopics<T extends { group: TopicGroup; sortOrder: number }>(
  topics: T[]
): TopicGroupBucket<T>[] {
  const buckets = new Map<TopicGroup, T[]>()
  for (const group of TOPIC_GROUP_ORDER) {
    buckets.set(group, [])
  }

  for (const topic of topics) {
    const key = buckets.has(topic.group) ? topic.group : "other"
    buckets.get(key)!.push(topic)
  }

  for (const list of buckets.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder)
  }

  return TOPIC_GROUP_ORDER.filter((group) => (buckets.get(group)?.length ?? 0) > 0).map(
    (group) => ({
      group,
      topics: buckets.get(group)!,
    })
  )
}
