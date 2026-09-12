"use client"

import type { ReactNode } from "react"
import { MotivationSection } from "@/components/motivation-section"
import { ComparisonTable } from "@/components/comparison-table"
import { SectionScrollSnap } from "@/components/section-scroll-snap"
import { SiteFooter } from "@/components/site-footer"
import { FeedbackFab } from "@/components/feedback-fab"
import { SiteHeader } from "@/components/site-header"
import type { ResolvedComparison } from "@/lib/comparison/types"

export function HomePageClient({
  comparison,
  hero,
}: {
  comparison: ResolvedComparison
  hero: ReactNode
}) {
  return (
    <div className="lang-fade min-h-screen bg-background">
      <SectionScrollSnap />
      <SiteHeader />
      <main>
        {hero}
        <ComparisonTable comparison={comparison} />
        <MotivationSection />
      </main>
      <SiteFooter />
      <FeedbackFab />
    </div>
  )
}
