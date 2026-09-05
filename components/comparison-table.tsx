"use client"

import { useDeferredValue, useMemo, useRef, useState } from "react"
import { ChevronDown, ExternalLink, Search, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { StanceBadge } from "@/components/stance-badge"
import { groupTopics, TOPIC_GROUP_ORDER } from "@/lib/comparison/groups"
import { cellKey } from "@/lib/comparison/get-comparison"
import type { ResolvedComparison, Stance, TopicGroup } from "@/lib/comparison/types"
import { cn, renderParagraphs } from "@/lib/utils"

type TopicViewFilter = "all" | "disagreement"

function partiesDisagree(
  topicId: string,
  partyIds: string[],
  cellsByKey: ResolvedComparison["cellsByKey"]
): boolean {
  if (partyIds.length < 2) return false
  const stances = new Set(
    partyIds.map(
      (partyId) => cellsByKey[cellKey(topicId, partyId)]?.stance ?? "none"
    )
  )
  return stances.size > 1
}

const MAJOR_PARTY_IDS = ["cdu", "spd", "gruene", "linke"] as const
const TOPIC_COL_PX = 220
const PARTY_COL_PX = 160

export function ComparisonTable({
  comparison,
}: {
  comparison: ResolvedComparison
}) {
  const { language, translations: t } = useLanguage()
  const { parties, topics, cellsByKey } = comparison

  const [selectedIds, setSelectedIds] = useState<string[]>([...MAJOR_PARTY_IDS])
  const [openTopicId, setOpenTopicId] = useState<string | null>(null)
  const [openMobileGroup, setOpenMobileGroup] = useState<TopicGroup | null>(null)
  const [topicQuery, setTopicQuery] = useState("")
  const deferredQuery = useDeferredValue(topicQuery)
  const [topicFilter, setTopicFilter] = useState<TopicViewFilter>("all")
  const [collapsedGroups, setCollapsedGroups] = useState<Set<TopicGroup>>(
    () => new Set(TOPIC_GROUP_ORDER)
  )

  const headerScrollRef = useRef<HTMLDivElement>(null)
  const bodyScrollRef = useRef<HTMLDivElement>(null)
  const syncingScroll = useRef(false)

  const selectedParties = useMemo(
    () => parties.filter((party) => selectedIds.includes(party.id)),
    [parties, selectedIds]
  )

  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const isSearching = normalizedQuery.length > 0
  const showDisagreements = topicFilter === "disagreement"
  const forceExpandGroups = isSearching || showDisagreements

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      if (showDisagreements) {
        if (
          !partiesDisagree(
            topic.id,
            selectedParties.map((party) => party.id),
            cellsByKey
          )
        ) {
          return false
        }
      }
      if (!isSearching) return true
      const label = topic.displayLabel.toLowerCase()
      const groupLabel = t.comparison.groups[topic.group].toLowerCase()
      return (
        label.includes(normalizedQuery) || groupLabel.includes(normalizedQuery)
      )
    })
  }, [
    topics,
    showDisagreements,
    selectedParties,
    cellsByKey,
    isSearching,
    normalizedQuery,
    t.comparison.groups,
  ])

  const topicGroups = useMemo(
    () => groupTopics(filteredTopics),
    [filteredTopics]
  )

  const tableMinWidth = TOPIC_COL_PX + selectedParties.length * PARTY_COL_PX
  const colSpan = 1 + selectedParties.length

  function syncScroll(source: "header" | "body") {
    const header = headerScrollRef.current
    const body = bodyScrollRef.current
    if (!header || !body || syncingScroll.current) return
    syncingScroll.current = true
    if (source === "body") header.scrollLeft = body.scrollLeft
    else body.scrollLeft = header.scrollLeft
    syncingScroll.current = false
  }

  function toggleParty(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        if (current.length === 1) return current
        return current.filter((partyId) => partyId !== id)
      }
      return [...current, id]
    })
  }

  function selectMajor() {
    setSelectedIds([...MAJOR_PARTY_IDS])
  }

  function selectAll() {
    setSelectedIds(parties.map((party) => party.id))
  }

  function toggleGroup(group: TopicGroup) {
    setCollapsedGroups((current) => {
      const next = new Set(current)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  function toggleMobileGroup(group: TopicGroup) {
    setOpenMobileGroup((current) => (current === group ? null : group))
    setOpenTopicId(null)
  }

  function isDesktopGroupCollapsed(group: TopicGroup) {
    if (forceExpandGroups) return false
    return collapsedGroups.has(group)
  }

  function isMobileGroupOpen(group: TopicGroup) {
    if (forceExpandGroups) return true
    return openMobileGroup === group
  }

  const countLabel = t.comparison.selectedCount.replace(
    "{count}",
    String(selectedParties.length)
  )

  const searchCountLabel = t.comparison.searchResultsCount.replace(
    "{count}",
    String(filteredTopics.length)
  )

  const desktopRows = useMemo(() => {
    let rowIndex = 0
    return topicGroups.map(({ group, topics: groupTopicList }) => ({
      group,
      topics: groupTopicList.map((topic) => ({
        topic,
        rowIndex: rowIndex++,
      })),
    }))
  }, [topicGroups])

  return (
    <section id="comparison" className="scroll-mt-[4.25rem] bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="section-title font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {t.comparison.title}
        </h2>
        <div className="mt-1 space-y-2 text-base">
          {renderParagraphs(t.comparison.subtitle, "text-muted-foreground leading-relaxed", language)}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-xs text-muted-foreground sm:mt-10">
          <Legend stance="for" label={t.comparison.legendFor} />
          <Legend stance="against" label={t.comparison.legendAgainst} />
          <Legend stance="mixed" label={t.comparison.legendMixed} />
          <Legend stance="none" label={t.comparison.legendNone} />
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl">
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              {t.comparison.partiesLabel}
              <span className="ml-2 font-normal text-muted-foreground">
                ({countLabel})
              </span>
            </p>
            <div className="flex items-center gap-2">
              <PresetButton
                active={selectedIds.length === parties.length}
                onClick={selectAll}
              >
                {t.comparison.showAll}
              </PresetButton>
              <PresetButton
                active={
                  selectedIds.length === MAJOR_PARTY_IDS.length &&
                  MAJOR_PARTY_IDS.every((id) => selectedIds.includes(id))
                }
                onClick={selectMajor}
              >
                {t.comparison.showMajor}
              </PresetButton>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {parties.map((party) => {
              const active = selectedIds.includes(party.id)
              return (
                <button
                  key={party.id}
                  type="button"
                  onClick={() => toggleParty(party.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {party.shortName}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <PresetButton
              active={topicFilter === "all"}
              onClick={() => setTopicFilter("all")}
            >
              {t.comparison.filterAll}
            </PresetButton>
            <PresetButton
              active={topicFilter === "disagreement"}
              onClick={() => setTopicFilter("disagreement")}
            >
              {t.comparison.filterDisagreement}
            </PresetButton>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {t.comparison.filterDisagreementHint}
          </p>

          <div className="relative mt-4">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={topicQuery}
              onChange={(event) => setTopicQuery(event.target.value)}
              placeholder={t.comparison.searchPlaceholder}
              aria-label={t.comparison.searchPlaceholder}
              className="h-10 w-full rounded-md border border-border bg-background pr-10 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {topicQuery && (
              <button
                type="button"
                onClick={() => setTopicQuery("")}
                className="absolute top-1/2 right-2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={t.comparison.searchClear}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {(isSearching || showDisagreements) && (
            <p className="mt-2 text-xs text-muted-foreground">{searchCountLabel}</p>
          )}

          <p className="mt-3 text-xs text-muted-foreground lg:hidden">
            {t.comparison.scrollHint}
          </p>
        </div>

        {filteredTopics.length === 0 ? (
          <p className="mt-6 rounded-xl border border-border bg-white px-4 py-8 text-center text-sm text-muted-foreground">
            {t.comparison.searchNoResults}
          </p>
        ) : (
        <>
        {/* Mobile: one group at a time; topics show stance strip at a glance */}
        <div className="mt-6 space-y-3 lg:hidden">
          {topicGroups.map(({ group, topics: groupTopicList }) => {
            const open = isMobileGroupOpen(group)
            const groupLabel = t.comparison.groups[group]
            return (
              <div
                key={group}
                className="overflow-hidden rounded-xl border border-border bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 bg-muted/50 px-4 py-3.5 text-left disabled:cursor-default"
                  aria-expanded={open}
                  aria-label={open ? t.comparison.collapseGroup : t.comparison.expandGroup}
                  disabled={forceExpandGroups}
                  onClick={() => toggleMobileGroup(group)}
                >
                  <span className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
                    {groupLabel}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({groupTopicList.length})
                    </span>
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>

                {open && (
                  <ul className="divide-y divide-border border-t border-border">
                    {groupTopicList.map((topic) => {
                      const detailOpen = openTopicId === topic.id
                      return (
                        <li key={topic.id}>
                          <button
                            type="button"
                            className="flex w-full flex-col gap-2.5 px-4 py-3.5 text-left"
                            aria-expanded={detailOpen}
                            onClick={() =>
                              setOpenTopicId((current) =>
                                current === topic.id ? null : topic.id
                              )
                            }
                          >
                            <span className="flex items-start justify-between gap-3">
                              <span className="text-sm font-semibold leading-snug text-foreground">
                                {topic.displayLabel}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                  detailOpen && "rotate-180"
                                )}
                              />
                            </span>
                            <span className="flex flex-wrap gap-1.5">
                              {selectedParties.map((party) => {
                                const cell =
                                  cellsByKey[cellKey(topic.id, party.id)]
                                const stance = cell?.stance ?? "none"
                                return (
                                  <span
                                    key={party.id}
                                    className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-1.5 py-0.5"
                                    title={`${party.shortName}: ${stance}`}
                                  >
                                    <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                      {party.shortName}
                                    </span>
                                    <StanceBadge
                                      stance={stance}
                                      className="h-5 min-w-5"
                                    />
                                  </span>
                                )
                              })}
                            </span>
                          </button>

                          {detailOpen && (
                            <ul className="divide-y divide-border border-t border-border bg-muted/20">
                              {selectedParties.map((party) => {
                                const cell =
                                  cellsByKey[cellKey(topic.id, party.id)]
                                const stance = cell?.stance ?? "none"
                                const summary = cell?.summary?.trim() ?? ""
                                return (
                                  <li key={party.id} className="px-4 py-3">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <StanceBadge stance={stance} />
                                        <span className="text-sm font-semibold text-foreground">
                                          {party.shortName}
                                        </span>
                                      </div>
                                      {party.programUrl ? (
                                        <a
                                          href={party.programUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                          onClick={(event) => event.stopPropagation()}
                                        >
                                          {t.comparison.openProgram}
                                          <ExternalLink
                                            className="h-3 w-3"
                                            aria-hidden
                                          />
                                        </a>
                                      ) : null}
                                    </div>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                      {summary || t.comparison.emptyCell}
                                    </p>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        {/* Desktop: grouped table */}
        <div className="mt-8 hidden lg:block">
          <div
            ref={headerScrollRef}
            onScroll={() => syncScroll("header")}
            className="sticky top-14 z-30 overflow-x-auto rounded-t-xl border border-border bg-muted shadow-[0_1px_0_hsl(var(--border))] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <table
              className="w-full table-fixed border-collapse text-left text-sm"
              style={{ minWidth: tableMinWidth }}
            >
              <colgroup>
                <col style={{ width: TOPIC_COL_PX }} />
                {selectedParties.map((party) => (
                  <col key={party.id} style={{ width: PARTY_COL_PX }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-40 border-r border-border bg-muted px-3 py-3 text-xs font-semibold uppercase tracking-wide text-foreground"
                  >
                    {t.comparison.topicColumn}
                  </th>
                  {selectedParties.map((party) => (
                    <th
                      key={party.id}
                      scope="col"
                      className="bg-muted px-3 py-3 text-xs font-semibold uppercase tracking-wide"
                    >
                      <a
                        href={party.programUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-primary"
                      >
                        {party.shortName}
                        <ExternalLink className="h-3 w-3 opacity-50" aria-hidden />
                        <span className="sr-only">{t.comparison.programLink}</span>
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>

          <div
            ref={bodyScrollRef}
            onScroll={() => syncScroll("body")}
            className="overflow-x-auto rounded-b-xl border border-t-0 border-border bg-white"
          >
            <table
              className="w-full table-fixed border-collapse text-left text-sm"
              style={{ minWidth: tableMinWidth }}
            >
              <colgroup>
                <col style={{ width: TOPIC_COL_PX }} />
                {selectedParties.map((party) => (
                  <col key={party.id} style={{ width: PARTY_COL_PX }} />
                ))}
              </colgroup>
              <tbody>
                {desktopRows.map(({ group, topics: groupTopicList }) => {
                  const collapsed = isDesktopGroupCollapsed(group)
                  const groupLabel = t.comparison.groups[group]
                  return (
                    <GroupRows
                      key={group}
                      groupLabel={groupLabel}
                      topicCount={groupTopicList.length}
                      collapsed={collapsed}
                      colSpan={colSpan}
                      topicColPx={TOPIC_COL_PX}
                      expandLabel={t.comparison.expandGroup}
                      collapseLabel={t.comparison.collapseGroup}
                      disableToggle={forceExpandGroups}
                      onToggle={() => toggleGroup(group)}
                    >
                      {!collapsed &&
                        groupTopicList.map(({ topic, rowIndex }) => (
                            <tr
                              key={topic.id}
                              className={
                                rowIndex % 2 === 0 ? "bg-white" : "bg-muted/30"
                              }
                            >
                              <th
                                scope="row"
                                className="sticky left-0 z-10 border-r border-border px-3 py-3 align-top text-left font-medium text-foreground"
                                style={{
                                  backgroundColor:
                                    rowIndex % 2 === 0
                                      ? "#ffffff"
                                      : "hsl(210 14% 96%)",
                                }}
                              >
                                {topic.displayLabel}
                              </th>
                              {selectedParties.map((party) => {
                                const cell =
                                  cellsByKey[cellKey(topic.id, party.id)]
                                const stance = cell?.stance ?? "none"
                                const summary = cell?.summary?.trim() ?? ""
                                return (
                                  <td
                                    key={party.id}
                                    className="border-b border-border/50 px-3 py-3 align-top text-muted-foreground"
                                  >
                                    <div className="flex gap-2">
                                      <StanceBadge
                                        stance={stance}
                                        className="mt-0.5 shrink-0"
                                      />
                                      <span className="min-w-0 flex-1 text-[13px] leading-snug">
                                        {summary || t.comparison.emptyCell}
                                      </span>
                                    </div>
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                    </GroupRows>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </section>
  )
}

function GroupRows({
  groupLabel,
  topicCount,
  collapsed,
  colSpan,
  topicColPx,
  expandLabel,
  collapseLabel,
  disableToggle,
  onToggle,
  children,
}: {
  groupLabel: string
  topicCount: number
  collapsed: boolean
  colSpan: number
  topicColPx: number
  expandLabel: string
  collapseLabel: string
  disableToggle?: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <>
      <tr className="bg-section-muted">
        <th
          colSpan={colSpan}
          className="sticky left-0 z-20 border-y border-border p-0 text-left"
          style={{ minWidth: topicColPx }}
        >
          <button
            type="button"
            onClick={onToggle}
            disabled={disableToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? expandLabel : collapseLabel}
            className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/80 disabled:cursor-default disabled:hover:bg-transparent"
          >
            <span className="font-display text-sm font-semibold tracking-[-0.01em] text-foreground">
              {groupLabel}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({topicCount})
              </span>
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                !collapsed && "rotate-180"
              )}
            />
          </button>
        </th>
      </tr>
      {children}
    </>
  )
}

function PresetButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-md border px-2.5 text-xs font-semibold transition-colors",
        active
          ? "border-foreground/20 bg-foreground text-background"
          : "border-border bg-background text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function Legend({
  stance,
  label,
}: {
  stance: Stance
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <StanceBadge stance={stance} />
      <span>{label}</span>
    </span>
  )
}
