"use client"

import { useEffect, useState, type ReactNode } from "react"
import { MotivationSection } from "@/components/motivation-section"
import { ComparisonTable } from "@/components/comparison-table"
import { SectionScrollSnap } from "@/components/section-scroll-snap"
import { SiteFooter } from "@/components/site-footer"
import { FeedbackFab } from "@/components/feedback-fab"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import type { Language } from "@/lib/i18n/types"
import type { ResolvedComparison } from "@/lib/comparison/types"

function ComparisonTableLoader({
  lang,
  seo,
}: {
  lang: Language
  /** Server-rendered comparison HTML (crawlable; not Client props). */
  seo: ReactNode
}) {
  const { translations: t } = useLanguage()
  const [comparison, setComparison] = useState<ResolvedComparison | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setComparison(null)
    setError(false)

    fetch(`/data/comparison/${lang}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<ResolvedComparison>
      })
      .then((data) => {
        if (!cancelled) setComparison(data)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })

    return () => {
      cancelled = true
    }
  }, [lang])

  // Keep SSR markup until the interactive table is ready (and if fetch fails).
  if (error || !comparison) {
    return (
      <>
        {seo}
        {error ? (
          <p className="sr-only" role="status">
            {t.comparison.title}
          </p>
        ) : null}
      </>
    )
  }

  return <ComparisonTable comparison={comparison} />
}

export function HomePageClient({
  lang,
  hero,
  comparisonSeo,
}: {
  lang: Language
  hero: ReactNode
  /** Server Component output — indexed HTML without serializing dataset as client props. */
  comparisonSeo: ReactNode
}) {
  return (
    <div className="lang-fade min-h-screen bg-background">
      <SectionScrollSnap />
      <SiteHeader />
      <main>
        {hero}
        <ComparisonTableLoader lang={lang} seo={comparisonSeo} />
        <MotivationSection />
      </main>
      <SiteFooter />
      <FeedbackFab />
    </div>
  )
}
