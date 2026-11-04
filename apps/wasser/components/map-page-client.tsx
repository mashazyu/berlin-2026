"use client"

import { SiteChrome } from "@/components/site-chrome"
import { MapSection } from "@/components/map-section"
import { QuickHelpLinks } from "@/components/quick-help-links"

export function MapPageClient() {
  return (
    <SiteChrome>
      <MapSection titleAs="h1" muted={false} />
      <QuickHelpLinks />
    </SiteChrome>
  )
}
