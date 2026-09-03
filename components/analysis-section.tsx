"use client"

import { useLanguage } from "@/components/language-provider"
import type { ResolvedComparison } from "@/lib/comparison/types"

export function AnalysisSection({
  comparison,
}: {
  comparison: ResolvedComparison
}) {
  const { translations: t } = useLanguage()
  const { analysis } = comparison

  return (
    <section id="analysis" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl animate-[rise_0.55s_ease-out_both]">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t.analysis.title}
        </h2>

        <AnalysisGroup
          title={t.analysis.consensusTitle}
          items={analysis.consensus}
        />
        <AnalysisGroup
          title={t.analysis.dividesTitle}
          items={analysis.divides}
        />
        <AnalysisGroup
          title={t.analysis.partyFeaturesTitle}
          items={analysis.partyFeatures}
        />
      </div>
    </section>
  )
}

function AnalysisGroup({
  title,
  items,
}: {
  title: string
  items: Array<{ id: string; title: string; body: string }>
}) {
  if (items.length === 0) return null
  return (
    <div className="mt-12">
      <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
      <div className="mt-6 space-y-8">
        {items.map((item) => (
          <article key={item.id}>
            <h4 className="font-display text-lg font-semibold text-foreground">
              {item.title}
            </h4>
            <p className="mt-2 text-muted-foreground leading-relaxed">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
