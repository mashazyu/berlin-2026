"use client"

import { SiteFooter } from "@/components/site-footer"
import { FeedbackFab } from "@/components/feedback-fab"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { renderParagraphs } from "@/lib/utils"

export function AiDisclosurePageClient() {
  const { language, translations } = useLanguage()
  const a = translations.aiDisclosure

  const sections: Array<{ title: string; body: string }> = [
    { title: a.howWeUseAi, body: a.howWeUseAiContent },
    { title: a.humanResponsibility, body: a.humanResponsibilityContent },
    { title: a.reviewAndAccuracy, body: a.reviewAndAccuracyContent },
    { title: a.contact, body: a.contactContent },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {a.title}
        </h1>
        <div className="mt-4 space-y-3">
          {renderParagraphs(a.intro, "text-muted-foreground leading-relaxed", language)}
        </div>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3">
                {renderParagraphs(
                  section.body,
                  "text-muted-foreground leading-relaxed",
                  language
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
