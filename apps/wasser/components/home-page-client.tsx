"use client"

import { SiteChrome } from "@/components/site-chrome"
import { MapSection } from "@/components/map-section"
import { NewsSection } from "@/components/news-section"
import { FaqSection } from "@/components/faq-section"
import { MentionsSection } from "@/components/mentions-section"

export function HomePageClient() {
  return (
    <SiteChrome>
      <MapSection titleAs="h1" muted={false} />
      <NewsSection
        titleAs="h2"
        muted
        layout="carousel"
        showViewAll
      />
      <FaqSection titleAs="h2" muted={false} width="wide" columns={2} />
      <MentionsSection muted layout="carousel" />
    </SiteChrome>
  )
}
