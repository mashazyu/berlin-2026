"use client"

import type { ReactNode } from "react"
import { MotivationSection } from "@/components/motivation-section"
import { ComparisonTable } from "@/components/comparison-table"
import { SectionScrollSnap } from "@/components/section-scroll-snap"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { ResolvedComparison } from "@/lib/comparison/types"
import { useLanguage } from "@/components/language-provider"

export function HomePageClient({
  comparisonByLang,
  hero,
}: {
  comparisonByLang: Record<string, ResolvedComparison>
  hero: ReactNode
}) {
  const { language } = useLanguage()
  const comparison = comparisonByLang[language] ?? comparisonByLang.en

  return (
    <div className="lang-fade min-h-screen bg-background" key={language}>
      <SectionScrollSnap />
      <SiteHeader />
      <main>
        {hero}
        <ComparisonTable comparison={comparison} />
        <MotivationSection />
      </main>
      <SiteFooter />
    </div>
  )
}
