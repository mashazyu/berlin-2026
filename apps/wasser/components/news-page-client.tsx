"use client"

import { SiteChrome } from "@/components/site-chrome"
import { NewsSection } from "@/components/news-section"
import { MentionsSection } from "@/components/mentions-section"

export function NewsPageClient() {
  return (
    <SiteChrome>
      <NewsSection titleAs="h1" muted={false} />
      <MentionsSection muted />
    </SiteChrome>
  )
}
