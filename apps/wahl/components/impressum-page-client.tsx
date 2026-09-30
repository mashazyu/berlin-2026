"use client"

import { SiteFooter } from "@/components/site-footer"
import { FeedbackFab } from "@/components/feedback-fab"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { legalLanguageFor } from "@/lib/i18n/get-translations"
import { renderParagraphs } from "@/lib/utils"

export function ImpressumPageClient() {
  const { language, translations } = useLanguage()
  const legalLang = legalLanguageFor(language)
  const i = translations.impressum

  const sections: Array<{ title: string; body: string }> = [
    { title: i.responsibleParty, body: i.responsiblePartyContent },
    { title: i.contact, body: i.contactContent },
    { title: i.editorial, body: i.editorialContent },
    { title: i.disclaimer, body: i.disclaimerContent },
    { title: i.liability, body: i.liabilityContent },
    { title: i.languageVersions, body: i.languageVersionsContent },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {i.title}
        </h1>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 whitespace-pre-line">
                {renderParagraphs(
                  section.body,
                  "text-muted-foreground leading-relaxed",
                  legalLang
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
      <FeedbackFab />
    </div>
  )
}
