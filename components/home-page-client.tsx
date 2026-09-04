"use client"

import { AboutSection } from "@/components/about-section"
import { ComparisonTable } from "@/components/comparison-table"
import { Hero } from "@/components/hero"
import { SectionScrollSnap } from "@/components/section-scroll-snap"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import type { ResolvedComparison } from "@/lib/comparison/types"
import { useLanguage } from "@/components/language-provider"

export function HomePageClient({
  comparisonByLang,
}: {
  comparisonByLang: Record<string, ResolvedComparison>
}) {
  const { language } = useLanguage()
  const comparison = comparisonByLang[language] ?? comparisonByLang.en

  return (
    <div className="lang-fade min-h-screen bg-background" key={language}>
      <SectionScrollSnap />
      <SiteHeader />
      <main>
        <Hero />
        <ComparisonTable comparison={comparison} />
        <AboutSection />
      </main>
      <SiteFooter />
    </div>
  )
}
