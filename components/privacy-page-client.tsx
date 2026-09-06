"use client"

import { SiteFooter } from "@/components/site-footer"
import { FeedbackFab } from "@/components/feedback-fab"
import { SiteHeader } from "@/components/site-header"
import { useLanguage } from "@/components/language-provider"
import { renderParagraphs } from "@/lib/utils"

export function PrivacyPageClient() {
  const { language, translations } = useLanguage()
  const p = translations.privacy

  const sections: Array<{ title: string; body: string }> = [
    { title: p.responsibleParty, body: p.responsiblePartyContent },
    { title: p.dataProcessed, body: p.dataProcessedContent },
    { title: p.hosting, body: p.hostingContent },
    { title: p.processors, body: p.processorsContent },
    { title: p.purposeOfProcessing, body: p.purposeOfProcessingContent },
    { title: p.retention, body: p.retentionContent },
    { title: p.cookies, body: p.cookiesContent },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {p.title}
        </h1>
        <div className="mt-4 space-y-3">
          {renderParagraphs(p.intro, "text-muted-foreground leading-relaxed", language)}
        </div>

        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 whitespace-pre-line">
                {renderParagraphs(
                  section.body,
                  "text-muted-foreground leading-relaxed",
                  language
                )}
              </div>
            </section>
          ))}

          <section>
            <h2 className="font-display text-xl font-semibold">{p.yourRights}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {p.yourRightsIntro}
            </p>
            <div className="mt-3 space-y-3">
              {renderParagraphs(
                p.yourRightsList,
                "text-muted-foreground leading-relaxed",
                language
              )}
            </div>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {p.contactInfo}
            </p>
            <h3 className="mt-8 font-display text-lg font-semibold">
              {p.supervisoryAuthority}
            </h3>
            <div className="mt-3 space-y-3 whitespace-pre-line">
              {renderParagraphs(
                p.supervisoryAuthorityContent,
                "text-muted-foreground leading-relaxed",
                language
              )}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
      <FeedbackFab />
    </div>
  )
}
