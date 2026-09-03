"use client"

import { useLanguage } from "@/components/language-provider"
import { StanceBadge } from "@/components/stance-badge"
import { cellKey } from "@/lib/comparison/get-comparison"
import type { ResolvedComparison } from "@/lib/comparison/types"
import { ExternalLink } from "lucide-react"

export function ComparisonTable({
  comparison,
}: {
  comparison: ResolvedComparison
}) {
  const { translations: t } = useLanguage()
  const { parties, topics, cellsByKey } = comparison

  return (
    <section id="table" className="scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl animate-[rise_0.55s_ease-out_both]">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.table.title}
          </h2>
          <p className="mt-3 text-muted-foreground">{t.table.subtitle}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <Legend stance="for" label={t.table.legendFor} />
            <Legend stance="against" label={t.table.legendAgainst} />
            <Legend stance="mixed" label={t.table.legendMixed} />
            <Legend stance="none" label={t.table.legendNone} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground md:hidden">
            {t.table.scrollHint}
          </p>
        </div>
      </div>

      <div className="mt-8 w-full overflow-x-auto border-y border-border/70 bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th
                scope="col"
                className="sticky left-0 top-0 z-30 min-w-[200px] border-b border-r border-border/70 bg-[hsl(180_40%_97%)] px-3 py-3 font-display text-xs font-bold uppercase tracking-wide text-foreground shadow-[2px_0_6px_-2px_rgba(0,0,0,0.08)]"
              >
                {t.table.topicColumn}
              </th>
              {parties.map((party) => (
                <th
                  key={party.id}
                  scope="col"
                  className="sticky top-0 z-20 min-w-[160px] border-b border-border/70 bg-[hsl(180_40%_97%)] px-3 py-3 font-display text-xs font-bold uppercase tracking-wide"
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
                className={rowIndex % 2 === 0 ? "bg-white/40" : "bg-primary/[0.03]"}
              >
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-border/50 bg-[inherit] px-3 py-3 align-top font-medium text-foreground shadow-[2px_0_6px_-2px_rgba(0,0,0,0.06)] backdrop-blur-sm"
                  style={{ backgroundColor: rowIndex % 2 === 0 ? "rgba(255,255,255,0.92)" : "hsla(188, 70%, 96%, 0.95)" }}
                >
                  {topic.displayLabel}
                </th>
                {parties.map((party) => {
                  const cell = cellsByKey[cellKey(topic.id, party.id)]
                  const stance = cell?.stance ?? "none"
                  const summary = cell?.summary?.trim() ?? ""
                  return (
                    <td
                      key={party.id}
                      className="border-b border-border/40 px-3 py-3 align-top text-muted-foreground"
                    >
                      <div className="flex gap-2">
                        <StanceBadge stance={stance} />
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
    </section>
  )
}

function Legend({
  stance,
  label,
}: {
  stance: "for" | "against" | "mixed" | "none"
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <StanceBadge stance={stance} />
      <span>{label}</span>
    </span>
  )
}
