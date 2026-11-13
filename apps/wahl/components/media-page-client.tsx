"use client"

import { useMemo, useState, type ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import { FeedbackFab } from "@/components/feedback-fab"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { selectionChipClassName, metaTagClassName } from "@/lib/chip-styles"
import type { TopicGroup } from "@/lib/comparison/types"
import type { MediaLean, MediaScope } from "@/lib/media/feeds"
import { MEDIA_TOPIC_GROUPS } from "@/lib/media/keywords"
import type { MediaFetchResult, MediaItem } from "@/lib/media/types"
import { ELECTION_DATE } from "@/lib/seo/election"
import { cn } from "@/lib/utils"

type ScopeFilter = "all" | MediaScope
type LeanFilter = "all" | Exclude<MediaLean, "local">
type TimeFilter = "all" | "24h" | "7d" | "30d" | "since_election"

/** Canonical party chips — keyword hits map onto these labels. */
const PARTY_FILTERS = [
  { id: "cdu", label: "CDU", keywords: ["cdu", "union"] },
  { id: "spd", label: "SPD", keywords: ["spd"] },
  { id: "gruene", label: "Grüne", keywords: ["grune", "grunen", "bundnis 90"] },
  { id: "linke", label: "Linke", keywords: ["linke", "die linke"] },
  { id: "afd", label: "AfD", keywords: ["afd"] },
  { id: "bsw", label: "BSW", keywords: ["bsw", "bundnis sahra"] },
  { id: "fdp", label: "FDP", keywords: ["fdp"] },
] as const

type PartyId = (typeof PARTY_FILTERS)[number]["id"]

const DAY_MS = 86_400_000

function formatDate(iso: string | null, language: string): string {
  if (!iso) return "—"
  const locale =
    language === "de"
      ? "de-DE"
      : language === "ru"
        ? "ru-RU"
        : language === "ar"
          ? "ar"
          : "en-GB"
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function leanLabel(
  lean: MediaLean,
  labels: { left: string; center: string; right: string }
): string | null {
  if (lean === "local") return null
  return labels[lean]
}

function partyLabels(hits: string[]): string[] {
  const out: string[] = []
  for (const party of PARTY_FILTERS) {
    if (party.keywords.some((keyword) => hits.includes(keyword))) {
      out.push(party.label)
    }
  }
  return out
}

function itemHasParty(item: MediaItem, partyId: PartyId): boolean {
  const party = PARTY_FILTERS.find((entry) => entry.id === partyId)
  if (!party) return false
  return party.keywords.some((keyword) => item.partyHits.includes(keyword))
}

/** Election-day poll close in Europe/Berlin (CEST on 2026-09-20). */
function electionUnlockMs(): number {
  return Date.parse(`${ELECTION_DATE}T18:00:00+02:00`)
}

function inTimeRange(
  iso: string | null,
  filter: TimeFilter,
  nowMs: number
): boolean {
  if (filter === "all") return true
  if (!iso) return false
  const published = Date.parse(iso)
  if (Number.isNaN(published)) return false
  if (filter === "since_election") return published >= electionUnlockMs()
  const age = nowMs - published
  if (filter === "24h") return age >= 0 && age <= DAY_MS
  if (filter === "7d") return age >= 0 && age <= 7 * DAY_MS
  if (filter === "30d") return age >= 0 && age <= 30 * DAY_MS
  return true
}

export function MediaPageClient({ data }: { data: MediaFetchResult }) {
  const { language, translations: t } = useLanguage()
  const m = t.media
  const groupLabels = t.comparison.groups
  const [scope, setScope] = useState<ScopeFilter>("all")
  const [lean, setLean] = useState<LeanFilter>("all")
  const [time, setTime] = useState<TimeFilter>("since_election")
  const [parties, setParties] = useState<PartyId[]>(() =>
    PARTY_FILTERS.map((party) => party.id)
  )
  const [topics, setTopics] = useState<TopicGroup[]>(() => [...MEDIA_TOPIC_GROUPS])
  const nowMs = useMemo(() => Date.now(), [data.fetchedAt])

  const filtered = useMemo(() => {
    const allParties = parties.length === PARTY_FILTERS.length
    const allTopics = topics.length === MEDIA_TOPIC_GROUPS.length

    return data.items.filter((item) => {
      if (!inTimeRange(item.publishedAt, time, nowMs)) return false
      if (scope !== "all" && item.scope !== scope) return false
      if (lean !== "all" && item.lean !== lean) return false

      if (parties.length === 0) return false
      if (!allParties && !parties.some((partyId) => itemHasParty(item, partyId))) {
        return false
      }

      if (topics.length === 0) return false
      if (!allTopics) {
        if (item.topicHits.length === 0) return false
        if (!topics.some((group) => item.topicHits.includes(group))) return false
      }

      return true
    })
  }, [data.items, scope, lean, time, parties, topics, nowMs])

  const timedItems = useMemo(
    () => data.items.filter((item) => inTimeRange(item.publishedAt, time, nowMs)),
    [data.items, time, nowMs]
  )

  const counts = useMemo(() => {
    const base = timedItems
    return {
      total: base.length,
      berlin: base.filter((i) => i.scope === "berlin").length,
      bund: base.filter((i) => i.scope === "bund").length,
      left: base.filter((i) => i.lean === "left").length,
      center: base.filter((i) => i.lean === "center").length,
      right: base.filter((i) => i.lean === "right").length,
      parties: Object.fromEntries(
        PARTY_FILTERS.map((party) => [
          party.id,
          base.filter((item) => itemHasParty(item, party.id)).length,
        ])
      ) as Record<PartyId, number>,
      topics: Object.fromEntries(
        MEDIA_TOPIC_GROUPS.map((group) => [
          group,
          base.filter((item) => item.topicHits.includes(group)).length,
        ])
      ) as Record<TopicGroup, number>,
    }
  }, [timedItems])

  const timeChips: { id: TimeFilter; label: string }[] = [
    { id: "all", label: m.timeAll },
    { id: "24h", label: m.time24h },
    { id: "7d", label: m.time7d },
    { id: "30d", label: m.time30d },
    { id: "since_election", label: m.timeSinceElection },
  ]

  const scopeChips: { id: ScopeFilter; label: string; count: number }[] = [
    { id: "all", label: m.filterAll, count: counts.total },
    { id: "berlin", label: m.filterBerlin, count: counts.berlin },
    { id: "bund", label: m.filterBund, count: counts.bund },
  ]

  const leanChips: { id: LeanFilter; label: string; count: number }[] = [
    { id: "all", label: m.filterAllLean, count: counts.total },
    { id: "left", label: m.leanLeft, count: counts.left },
    { id: "center", label: m.leanCenter, count: counts.center },
    { id: "right", label: m.leanRight, count: counts.right },
  ]

  function toggleParty(partyId: PartyId) {
    setParties((current) =>
      current.includes(partyId)
        ? current.filter((id) => id !== partyId)
        : [...current, partyId]
    )
  }

  function toggleTopic(group: TopicGroup) {
    setTopics((current) =>
      current.includes(group)
        ? current.filter((id) => id !== group)
        : [...current, group]
    )
  }

  if (!data.active) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main>
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-sm font-medium text-muted-foreground">{m.kicker}</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
              {m.title}
            </h1>
            <p className="mt-8 max-w-2xl font-display text-xl font-semibold tracking-[-0.01em]">
              {m.inactiveTitle}
            </p>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {m.inactiveBody}
            </p>
          </div>
        </main>
        <SiteFooter />
        <FeedbackFab />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-sm font-medium text-muted-foreground">{m.kicker}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {m.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {m.subtitle}
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label={m.statTotal} value={filtered.length} />
            <StatCard
              label={m.filterBerlin}
              value={filtered.filter((i) => i.scope === "berlin").length}
            />
            <StatCard
              label={m.filterBund}
              value={filtered.filter((i) => i.scope === "bund").length}
            />
            <StatCard
              label={m.statSources}
              value={new Set(filtered.map((i) => i.source)).size}
            />
          </div>

          <div className="mt-10 space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                {m.partyHeading}
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-between">
                <div className="flex min-w-0 flex-wrap gap-2">
                  {PARTY_FILTERS.map((party) => {
                    const active = parties.includes(party.id)
                    return (
                      <button
                        key={party.id}
                        type="button"
                        className={selectionChipClassName(active)}
                        onClick={() => toggleParty(party.id)}
                        aria-pressed={active}
                      >
                        {party.label}
                        <span className="ms-1.5 tabular-nums opacity-70">
                          {counts.parties[party.id]}
                        </span>
                      </button>
                    )
                  })}
                </div>
                <label
                  htmlFor="media-time-filter"
                  className="flex shrink-0 items-center gap-2 text-sm font-medium text-foreground sm:ms-auto"
                >
                  <span>{m.timeHeading}</span>
                  <select
                    id="media-time-filter"
                    value={time}
                    onChange={(event) =>
                      setTime(event.target.value as TimeFilter)
                    }
                    className={cn(
                      selectionChipClassName(false),
                      "cursor-pointer pe-8 font-medium"
                    )}
                  >
                    {timeChips.map((chip) => (
                      <option key={chip.id} value={chip.id}>
                        {chip.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <FilterRow label={m.scopeHeading} className="min-w-0">
                {scopeChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className={selectionChipClassName(scope === chip.id)}
                    onClick={() => setScope(chip.id)}
                    aria-pressed={scope === chip.id}
                  >
                    {chip.label}
                    <span className="ms-1.5 tabular-nums opacity-70">
                      {chip.count}
                    </span>
                  </button>
                ))}
              </FilterRow>
              <FilterRow
                label={m.leanHeading}
                className="min-w-0 sm:ms-auto sm:text-end"
                chipsClassName="sm:justify-end"
              >
                {leanChips.map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    className={selectionChipClassName(lean === chip.id)}
                    onClick={() => setLean(chip.id)}
                    aria-pressed={lean === chip.id}
                  >
                    {chip.label}
                    <span className="ms-1.5 tabular-nums opacity-70">
                      {chip.count}
                    </span>
                  </button>
                ))}
              </FilterRow>
            </div>

            <FilterRow label={m.topicHeading}>
              {MEDIA_TOPIC_GROUPS.map((group) => {
                const active = topics.includes(group)
                return (
                  <button
                    key={group}
                    type="button"
                    className={selectionChipClassName(active)}
                    onClick={() => toggleTopic(group)}
                    aria-pressed={active}
                  >
                    {groupLabels[group]}
                    <span className="ms-1.5 tabular-nums opacity-70">
                      {counts.topics[group]}
                    </span>
                  </button>
                )
              })}
            </FilterRow>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {m.showing
              .replace("{count}", String(filtered.length))
              .replace("{total}", String(data.items.length))}
            {data.fetchedAt
              ? ` · ${m.updated.replace("{date}", formatDate(data.fetchedAt, language))}`
              : null}
          </p>

          <ul className="mt-6 divide-y divide-border border-y border-border">
            {filtered.length === 0 ? (
              <li className="py-10 text-center text-muted-foreground">
                {m.empty}
              </li>
            ) : (
              filtered.map((item) => (
                <MediaRow
                  key={item.id}
                  item={item}
                  language={language}
                  leanLabels={{
                    left: m.leanLeft,
                    center: m.leanCenter,
                    right: m.leanRight,
                  }}
                  groupLabels={groupLabels}
                  scopeBerlin={m.filterBerlin}
                  scopeBund={m.filterBund}
                  openLabel={m.openSource}
                />
              ))
            )}
          </ul>

          <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
            {m.disclaimer}
          </p>

          {data.feedErrors.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground/80">
              {m.partialErrors.replace(
                "{sources}",
                [...new Set(data.feedErrors.map((e) => e.source))].join(", ")
              )}
            </p>
          ) : null}
        </div>
      </main>
      <SiteFooter />
      <FeedbackFab />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-section-muted px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  )
}

function FilterRow({
  label,
  children,
  className,
  chipsClassName,
}: {
  label: string
  children: ReactNode
  className?: string
  chipsClassName?: string
}) {
  return (
    <div className={className}>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className={cn("flex flex-wrap gap-2", chipsClassName)}>{children}</div>
    </div>
  )
}

function MediaRow({
  item,
  language,
  leanLabels,
  groupLabels,
  scopeBerlin,
  scopeBund,
  openLabel,
}: {
  item: MediaItem
  language: string
  leanLabels: { left: string; center: string; right: string }
  groupLabels: Record<TopicGroup, string>
  scopeBerlin: string
  scopeBund: string
  openLabel: string
}) {
  const lean = leanLabel(item.lean, leanLabels)

  return (
    <li className="flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <time
            dateTime={item.publishedAt ?? undefined}
            className="text-sm tabular-nums text-muted-foreground"
          >
            {formatDate(item.publishedAt, language)}
          </time>
          <span className={metaTagClassName()}>{item.source}</span>
          {lean ? <span className={metaTagClassName()}>{lean}</span> : null}
          <span className={metaTagClassName()}>
            {item.scope === "berlin" ? scopeBerlin : scopeBund}
          </span>
          {partyLabels(item.partyHits).map((party) => (
            <span key={party} className={metaTagClassName()}>
              {party}
            </span>
          ))}
          {item.topicHits.map((group) => (
            <span key={group} className={metaTagClassName()}>
              {groupLabels[group]}
            </span>
          ))}
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block font-display text-lg font-semibold tracking-[-0.01em] text-foreground transition-colors hover:text-primary"
        >
          {item.title}
        </a>
        {item.summary ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        ) : null}
      </div>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          selectionChipClassName(false),
          "shrink-0 gap-1.5 self-start"
        )}
      >
        {openLabel}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </li>
  )
}
