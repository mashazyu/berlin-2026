"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { ExternalLink, ListFilter, X } from "lucide-react"
import { FeedbackFab } from "@/components/feedback-fab"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { selectionChipClassName, metaTagClassName } from "@/lib/chip-styles"
import type { TopicGroup } from "@/lib/comparison/types"
import { MEDIA_FEEDS, type MediaLean, type MediaScope } from "@/lib/media/feeds"
import { MEDIA_TOPIC_GROUPS } from "@/lib/media/keywords"
import type { MediaFetchResult, MediaItem } from "@/lib/media/types"
import { ELECTION_DATE } from "@/lib/seo/election"
import { cn } from "@/lib/utils"

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

const LEAN_ORDER: Exclude<MediaLean, "local">[] = ["left", "center", "right"]

const DAY_MS = 86_400_000

type Outlet = {
  source: string
  lean: MediaLean
  scopes: Set<MediaScope>
}

function buildOutlets(): Outlet[] {
  const bySource = new Map<string, Outlet>()
  for (const feed of MEDIA_FEEDS) {
    const existing = bySource.get(feed.source)
    if (existing) {
      existing.scopes.add(feed.scope)
      // Prefer political lean over "local" when both exist for one brand
      if (existing.lean === "local" && feed.lean !== "local") {
        existing.lean = feed.lean
      }
    } else {
      bySource.set(feed.source, {
        source: feed.source,
        lean: feed.lean,
        scopes: new Set([feed.scope]),
      })
    }
  }
  return [...bySource.values()]
}

const ALL_OUTLETS = buildOutlets()

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

function outletsForScope(scope: MediaScope): Outlet[] {
  return ALL_OUTLETS.filter((outlet) => outlet.scopes.has(scope))
}

function sourcesForScope(scope: MediaScope): string[] {
  return outletsForScope(scope).map((outlet) => outlet.source)
}

export function MediaPageClient({ data }: { data: MediaFetchResult }) {
  const { language, translations: t } = useLanguage()
  const m = t.media
  const groupLabels = t.comparison.groups
  const [scope, setScope] = useState<MediaScope>("berlin")
  const [sources, setSources] = useState<string[]>(() =>
    sourcesForScope("berlin")
  )
  const [time, setTime] = useState<TimeFilter>("since_election")
  const [parties, setParties] = useState<PartyId[]>(() =>
    PARTY_FILTERS.map((party) => party.id)
  )
  const [topics, setTopics] = useState<TopicGroup[]>(() => [...MEDIA_TOPIC_GROUPS])
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const nowMs = useMemo(() => Date.now(), [data.fetchedAt])

  const scopeOutlets = useMemo(() => outletsForScope(scope), [scope])

  useEffect(() => {
    setSources(sourcesForScope(scope))
  }, [scope])

  useEffect(() => {
    if (!sourcesOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSourcesOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sourcesOpen])

  const filtered = useMemo(() => {
    const allParties = parties.length === PARTY_FILTERS.length
    const allTopics = topics.length === MEDIA_TOPIC_GROUPS.length
    const sourceSet = new Set(sources)

    return data.items.filter((item) => {
      if (!inTimeRange(item.publishedAt, time, nowMs)) return false
      if (item.scope !== scope) return false
      if (sources.length === 0) return false
      if (!sourceSet.has(item.source)) return false

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
  }, [data.items, scope, sources, time, parties, topics, nowMs])

  const timedScopedItems = useMemo(
    () =>
      data.items.filter(
        (item) =>
          item.scope === scope && inTimeRange(item.publishedAt, time, nowMs)
      ),
    [data.items, scope, time, nowMs]
  )

  const counts = useMemo(() => {
    const base = timedScopedItems
    return {
      total: base.length,
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
      sources: Object.fromEntries(
        scopeOutlets.map((outlet) => [
          outlet.source,
          base.filter((item) => item.source === outlet.source).length,
        ])
      ) as Record<string, number>,
    }
  }, [timedScopedItems, scopeOutlets])

  const outletsByLean = useMemo(() => {
    const groups: {
      lean: Exclude<MediaLean, "local"> | "local"
      label: string
      outlets: Outlet[]
    }[] = []

    for (const lean of LEAN_ORDER) {
      const outlets = scopeOutlets.filter((outlet) => outlet.lean === lean)
      if (outlets.length === 0) continue
      groups.push({
        lean,
        label:
          lean === "left"
            ? m.leanLeft
            : lean === "center"
              ? m.leanCenter
              : m.leanRight,
        outlets,
      })
    }

    const localOutlets = scopeOutlets.filter((outlet) => outlet.lean === "local")
    if (localOutlets.length > 0) {
      groups.push({
        lean: "local",
        label: m.leanLocal,
        outlets: localOutlets,
      })
    }

    return groups
  }, [scopeOutlets, m.leanLeft, m.leanCenter, m.leanRight, m.leanLocal])

  const timeChips: { id: TimeFilter; label: string }[] = [
    { id: "all", label: m.timeAll },
    { id: "24h", label: m.time24h },
    { id: "7d", label: m.time7d },
    { id: "30d", label: m.time30d },
    { id: "since_election", label: m.timeSinceElection },
  ]

  const scopeTabs: { id: MediaScope; label: string; count: number }[] = [
    {
      id: "berlin",
      label: m.filterBerlin,
      count: data.items.filter(
        (item) =>
          item.scope === "berlin" && inTimeRange(item.publishedAt, time, nowMs)
      ).length,
    },
    {
      id: "bund",
      label: m.filterGermany,
      count: data.items.filter(
        (item) =>
          item.scope === "bund" && inTimeRange(item.publishedAt, time, nowMs)
      ).length,
    },
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

  function toggleSource(source: string) {
    setSources((current) =>
      current.includes(source)
        ? current.filter((id) => id !== source)
        : [...current, source]
    )
  }

  function selectAllSources() {
    setSources(scopeOutlets.map((outlet) => outlet.source))
  }

  function clearSources() {
    setSources([])
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

  const leanLabels = {
    left: m.leanLeft,
    center: m.leanCenter,
    right: m.leanRight,
  }

  const outletPanel = (
    <OutletPanel
      heading={m.sourcesHeading}
      groups={outletsByLean}
      sources={sources}
      counts={counts.sources}
      onToggle={toggleSource}
      onSelectAll={selectAllSources}
      onClear={clearSources}
      selectAllLabel={m.sourcesSelectAll}
      clearLabel={m.sourcesClear}
    />
  )

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-sm font-medium text-muted-foreground">{m.kicker}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {m.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {m.subtitle}
          </p>

          <label
            htmlFor="media-time-filter"
            className="mt-8 flex w-full items-center justify-end gap-2 text-sm font-medium text-foreground"
          >
            <span>{m.timeHeading}</span>
            <select
              id="media-time-filter"
              value={time}
              onChange={(event) => setTime(event.target.value as TimeFilter)}
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

          <div
            className="mt-6 border-b border-border"
            role="tablist"
            aria-label={m.scopeHeading}
          >
            <div className="-mb-px flex gap-0">
              {scopeTabs.map((tab) => {
                const active = scope === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    id={`media-scope-${tab.id}`}
                    aria-selected={active}
                    aria-controls="media-scope-panel"
                    className={cn(
                      "relative -mb-px border-b-2 px-5 py-3 font-display text-base font-semibold tracking-[-0.01em] transition-colors sm:text-lg",
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                    onClick={() => setScope(tab.id)}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        "ms-2 font-sans text-sm font-medium tabular-nums",
                        active ? "text-primary" : "text-muted-foreground/70"
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div
            id="media-scope-panel"
            role="tabpanel"
            aria-labelledby={`media-scope-${scope}`}
            className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center justify-end gap-3 lg:hidden">
                <button
                  type="button"
                  className={cn(
                    selectionChipClassName(sourcesOpen),
                    "gap-1.5"
                  )}
                  onClick={() => setSourcesOpen(true)}
                  aria-expanded={sourcesOpen}
                >
                  <ListFilter className="size-3.5" aria-hidden />
                  {m.sourcesOpen}
                  <span className="tabular-nums opacity-70">
                    {sources.length}/{scopeOutlets.length}
                  </span>
                </button>
              </div>

              <div className="mt-6 space-y-5 lg:mt-0">
                <FilterRow label={m.partyHeading}>
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
                </FilterRow>

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
                  .replace("{total}", String(timedScopedItems.length))}
                {data.fetchedAt
                  ? ` · ${m.updated.replace("{date}", formatDate(data.fetchedAt, language))}`
                  : null}
              </p>

              <ul className="mt-4 divide-y divide-border border-y border-border">
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
                      leanLabels={leanLabels}
                      groupLabels={groupLabels}
                      scopeBerlin={m.filterBerlin}
                      scopeGermany={m.filterGermany}
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

            <aside className="hidden lg:block">
              <div className="sticky top-24 border border-border bg-section-muted/40 p-4">
                {outletPanel}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
      <FeedbackFab />

      {sourcesOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/40"
            aria-label={m.sourcesDone}
            onClick={() => setSourcesOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={m.sourcesHeading}
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-xl border border-border bg-background p-5 shadow-lg"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-display text-lg font-semibold tracking-[-0.01em]">
                {m.sourcesHeading}
              </p>
              <button
                type="button"
                className={selectionChipClassName(false)}
                onClick={() => setSourcesOpen(false)}
              >
                <X className="size-3.5" aria-hidden />
                {m.sourcesDone}
              </button>
            </div>
            {outletPanel}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function OutletPanel({
  heading,
  groups,
  sources,
  counts,
  onToggle,
  onSelectAll,
  onClear,
  selectAllLabel,
  clearLabel,
}: {
  heading: string
  groups: {
    lean: string
    label: string
    outlets: Outlet[]
  }[]
  sources: string[]
  counts: Record<string, number>
  onToggle: (source: string) => void
  onSelectAll: () => void
  onClear: () => void
  selectAllLabel: string
  clearLabel: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{heading}</p>
        <div className="flex gap-1">
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            onClick={onSelectAll}
          >
            {selectAllLabel}
          </button>
          <span className="text-xs text-muted-foreground/50" aria-hidden>
            ·
          </span>
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            onClick={onClear}
          >
            {clearLabel}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-5">
        {groups.map((group) => (
          <div key={group.lean}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-1.5">
              {group.outlets.map((outlet) => {
                const active = sources.includes(outlet.source)
                return (
                  <li key={outlet.source}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-background text-foreground"
                          : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="size-3.5 accent-primary"
                        checked={active}
                        onChange={() => onToggle(outlet.source)}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {outlet.source}
                      </span>
                      <span className="tabular-nums text-xs opacity-70">
                        {counts[outlet.source] ?? 0}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
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
  scopeGermany,
  openLabel,
}: {
  item: MediaItem
  language: string
  leanLabels: { left: string; center: string; right: string }
  groupLabels: Record<TopicGroup, string>
  scopeBerlin: string
  scopeGermany: string
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
            {item.scope === "berlin" ? scopeBerlin : scopeGermany}
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
