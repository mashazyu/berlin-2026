"use client"

import { useMemo, useState, type ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import { FeedbackFab } from "@/components/feedback-fab"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { selectionChipClassName, metaTagClassName } from "@/lib/chip-styles"
import type { MediaLean, MediaScope } from "@/lib/media/feeds"
import type { MediaFetchResult, MediaItem } from "@/lib/media/types"
import { cn } from "@/lib/utils"

type ScopeFilter = "all" | MediaScope
type LeanFilter = "all" | MediaLean

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
  labels: { left: string; center: string; right: string; local: string }
): string {
  return labels[lean]
}

const PARTY_DISPLAY: Record<string, string> = {
  cdu: "CDU",
  spd: "SPD",
  grune: "Grüne",
  grunen: "Grüne",
  "bundnis 90": "Grüne",
  linke: "Linke",
  "die linke": "Linke",
  afd: "AfD",
  bsw: "BSW",
  "bundnis sahra": "BSW",
  fdp: "FDP",
  union: "Union",
}

function partyLabels(hits: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const hit of hits) {
    const label = PARTY_DISPLAY[hit] ?? hit
    if (seen.has(label)) continue
    seen.add(label)
    out.push(label)
  }
  return out
}

export function MediaPageClient({ data }: { data: MediaFetchResult }) {
  const { language, translations: t } = useLanguage()
  const m = t.media
  const [scope, setScope] = useState<ScopeFilter>("all")
  const [lean, setLean] = useState<LeanFilter>("all")

  const filtered = useMemo(() => {
    return data.items.filter((item) => {
      if (scope !== "all" && item.scope !== scope) return false
      if (lean !== "all" && item.lean !== lean) return false
      return true
    })
  }, [data.items, scope, lean])

  const counts = useMemo(() => {
    const base = data.items
    return {
      total: base.length,
      berlin: base.filter((i) => i.scope === "berlin").length,
      bund: base.filter((i) => i.scope === "bund").length,
      left: base.filter((i) => i.lean === "left").length,
      center: base.filter((i) => i.lean === "center").length,
      right: base.filter((i) => i.lean === "right").length,
      local: base.filter((i) => i.lean === "local").length,
    }
  }, [data.items])

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
    { id: "local", label: m.leanLocal, count: counts.local },
  ]

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
            <StatCard label={m.statTotal} value={counts.total} />
            <StatCard label={m.filterBerlin} value={counts.berlin} />
            <StatCard label={m.filterBund} value={counts.bund} />
            <StatCard
              label={m.statSources}
              value={new Set(data.items.map((i) => i.source)).size}
            />
          </div>

          <div className="mt-10 space-y-4">
            <FilterRow label={m.scopeHeading}>
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
            <FilterRow label={m.leanHeading}>
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
                    local: m.leanLocal,
                  }}
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
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function MediaRow({
  item,
  language,
  leanLabels,
  scopeBerlin,
  scopeBund,
  openLabel,
}: {
  item: MediaItem
  language: string
  leanLabels: { left: string; center: string; right: string; local: string }
  scopeBerlin: string
  scopeBund: string
  openLabel: string
}) {
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
          <span className={metaTagClassName()}>
            {leanLabel(item.lean, leanLabels)}
          </span>
          <span className={metaTagClassName()}>
            {item.scope === "berlin" ? scopeBerlin : scopeBund}
          </span>
          {partyLabels(item.partyHits).map((party) => (
            <span key={party} className={metaTagClassName()}>
              {party}
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
