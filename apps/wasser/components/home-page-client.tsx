"use client"

import { SiteChrome } from "@/components/site-chrome"
import { MapSection } from "@/components/map-section"
import { QuickHelpLinks } from "@/components/quick-help-links"

/** Map is the product home — same content as the former /map route. */
export function HomePageClient() {
  return (
    <SiteChrome>
      <MapSection titleAs="h1" muted={false} />
      <QuickHelpLinks />
    </SiteChrome>
  )
}
