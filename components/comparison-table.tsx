"use client"

import { useMemo, useState } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { StanceBadge } from "@/components/stance-badge"
import { cellKey } from "@/lib/comparison/get-comparison"
import type { ResolvedComparison, Stance } from "@/lib/comparison/types"
import { cn } from "@/lib/utils"

const MAJOR_PARTY_IDS = ["cdu", "spd", "gruene", "linke"] as const

export function ComparisonTable({
  comparison,
}: {
  comparison: ResolvedComparison
}) {
  const { translations: t } = useLanguage()
  const { parties, topics, cellsByKey } = comparison

  const [selectedIds, setSelectedIds] = useState<string[]>([...MAJOR_PARTY_IDS])
  const [openTopicId, setOpenTopicId] = useState<string | null>(topics[0]?.id ?? null)

  const selectedParties = useMemo(
    () => parties.filter((party) => selectedIds.includes(party.id)),
    [parties, selectedIds]
  )

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

  const countLabel = t.table.selectedCount.replace(
    "{count}",
    String(selectedParties.length)
  )

  return (
    <section id="table" className="scroll-mt-[4.25rem] bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="section-title font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t.table.title}
        </h2>
        <p className="mt-3 text-muted-foreground">{t.table.subtitle}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <Legend stance="for" label={t.table.legendFor} />
          <Legend stance="against" label={t.table.legendAgainst} />
          <Legend stance="mixed" label={t.table.legendMixed} />
          <Legend stance="none" label={t.table.legendNone} />
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl">
        <div className="rounded-xl border border-border bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">
              {t.table.partiesLabel}
              <span className="ml-2 font-normal text-muted-foreground">
                ({countLabel})
              </span>
            </p>
            <div className="flex items-center gap-2">
              <PresetButton
                active={selectedIds.length === parties.length}
                onClick={selectAll}
              >
                {t.table.showAll}
              </PresetButton>
              <PresetButton
                active={
                  selectedIds.length === MAJOR_PARTY_IDS.length &&
                  MAJOR_PARTY_IDS.every((id) => selectedIds.includes(id))
                }
                onClick={selectMajor}
              >
                {t.table.showMajor}
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
          <p className="mt-3 text-xs text-muted-foreground lg:hidden">
            {t.table.scrollHint}
          </p>
        </div>

        <div className="mt-6 space-y-3 lg:hidden">
          {topics.map((topic) => {
            const open = openTopicId === topic.id
            return (
              <div
                key={topic.id}
                className="overflow-hidden rounded-xl border border-border bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left"
                  aria-expanded={open}
                  onClick={() =>
                    setOpenTopicId((current) =>
                      current === topic.id ? null : topic.id
                    )
                  }
                >
                  <span className="font-display text-sm font-semibold leading-snug text-foreground sm:text-base">
                    {topic.displayLabel}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
                    {open ? t.table.collapseTopic : t.table.expandTopic}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        open && "rotate-180"
                      )}
                    />
                  </span>
                </button>

                {open && (
                  <ul className="divide-y divide-border border-t border-border">
                    {selectedParties.map((party) => {
                      const cell = cellsByKey[cellKey(topic.id, party.id)]
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
                            <a
                              href={party.programUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              {t.table.openProgram}
                              <ExternalLink className="h-3 w-3" aria-hidden />
                            </a>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {summary || t.table.emptyCell}
                          </p>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 hidden overflow-hidden rounded-xl border border-border bg-white lg:block">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-30 w-[220px] min-w-[200px] max-w-[260px] border-b border-r border-border bg-muted px-3 py-3 font-display text-xs font-bold uppercase tracking-wide text-foreground"
                  >
                    {t.table.topicColumn}
                  </th>
                  {selectedParties.map((party) => (
                    <th
                      key={party.id}
                      scope="col"
                      className="z-20 min-w-[150px] border-b border-border bg-muted px-3 py-3 font-display text-xs font-bold uppercase tracking-wide"
                    >
                      <a
                        href={party.programUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-primary"
                      >
                        {party.shortName}
                        <ExternalLink className="h-3 w-3 opacity-50" aria-hidden />
                        <span className="sr-only">{t.table.programLink}</span>
                      </a>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topics.map((topic, rowIndex) => (
                  <tr
                    key={topic.id}
                    className={rowIndex % 2 === 0 ? "bg-white" : "bg-muted/30"}
                  >
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-r border-border px-3 py-3 align-top text-left font-medium text-foreground"
                      style={{
                        backgroundColor:
                          rowIndex % 2 === 0
                            ? "#ffffff"
                            : "hsl(180 24% 96%)",
                      }}
                    >
                      {topic.displayLabel}
                    </th>
                    {selectedParties.map((party) => {
                      const cell = cellsByKey[cellKey(topic.id, party.id)]
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
                              {summary || t.table.emptyCell}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
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
