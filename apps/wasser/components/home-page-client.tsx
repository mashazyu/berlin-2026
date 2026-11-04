"use client"

import { SiteChrome } from "@/components/site-chrome"
import { MapSection } from "@/components/map-section"
import { FaqSection } from "@/components/faq-section"

/** Map is the product home — FAQ follows in place of the old quick-help strip. */
export function HomePageClient() {
  return (
    <SiteChrome>
      <MapSection titleAs="h1" muted={false} />
      <FaqSection titleAs="h2" muted width="wide" columns={2} />
    </SiteChrome>
  )
}
