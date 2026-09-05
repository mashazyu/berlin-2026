"use client"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { renderParagraphs } from "@/lib/utils"

export function AboutPageClient() {
  const { language, translations } = useLanguage()
  const a = translations.about

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {a.title}
        </h1>
        <div className="mt-6 space-y-4">
          {renderParagraphs(a.body, "text-muted-foreground leading-relaxed", language)}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
