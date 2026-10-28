"use client"

import Link from "next/link"
import { SiteChrome, useSiteChrome } from "@/components/site-chrome"
import { COLLECTIVE_EMAIL } from "@/lib/contacts"
import { legalLanguageFor, withContactEmail } from "@/lib/i18n"
import { renderParagraphs } from "@/lib/rich-text"

type LegalKind = "impressum" | "privacy" | "aiDisclosure"

export function LegalPageClient({ kind }: { kind: LegalKind }) {
  const { language, t } = useSiteChrome()
  const legalLang = legalLanguageFor(language)

  if (kind === "aiDisclosure") {
    const a = t.aiDisclosure
    const sections = [
      { title: a.howWeUseAi, body: a.howWeUseAiContent },
      { title: a.humanResponsibility, body: a.humanResponsibilityContent },
      { title: a.reviewAndAccuracy, body: a.reviewAndAccuracyContent },
      {
        title: a.contact,
        body: withContactEmail(a.contactContent, COLLECTIVE_EMAIL),
      },
    ]
    return (
      <SiteChrome>
        <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {a.title}
          </h1>
          <div className="mt-4 space-y-3">
            {renderParagraphs(a.intro)}
          </div>
          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-xl font-semibold">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {renderParagraphs(section.body)}
                </div>
              </section>
            ))}
          </div>
        </main>
      </SiteChrome>
    )
  }

  if (kind === "impressum") {
    const i = t.impressum
    const sections = [
      { title: i.responsibleParty, body: i.responsiblePartyContent },
      {
        title: i.contact,
        body: withContactEmail(i.contactContent, COLLECTIVE_EMAIL),
      },
      { title: i.editorial, body: i.editorialContent },
      { title: i.disclaimer, body: i.disclaimerContent },
      { title: i.liability, body: i.liabilityContent },
      { title: i.languageVersions, body: i.languageVersionsContent },
    ]
    return (
      <SiteChrome>
        <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {i.title}
          </h1>
          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-xl font-semibold">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3">
                  {renderParagraphs(section.body)}
                </div>
              </section>
            ))}
          </div>
        </main>
      </SiteChrome>
    )
  }

  const p = t.privacy
  const otherLang = legalLang === "en" ? "de" : "en"
  const otherLabel =
    legalLang === "en"
      ? "Datenschutzerklärung auf Deutsch"
      : "Privacy policy in English"
  const sections = [
    {
      title: p.responsibleParty,
      body: withContactEmail(p.responsiblePartyContent, COLLECTIVE_EMAIL),
    },
    { title: p.dataProcessed, body: p.dataProcessedContent },
    { title: p.hosting, body: p.hostingContent },
    { title: p.processors, body: p.processorsContent },
    { title: p.purposeOfProcessing, body: p.purposeOfProcessingContent },
    { title: p.retention, body: p.retentionContent },
    { title: p.cookies, body: p.cookiesContent },
  ]

  return (
    <SiteChrome>
      <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {p.title}
        </h1>
        <div className="mt-4 space-y-3">{renderParagraphs(p.intro)}</div>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-xl font-semibold">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3">{renderParagraphs(section.body)}</div>
            </section>
          ))}
          <section>
            <h2 className="font-display text-xl font-semibold">{p.yourRights}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {p.yourRightsIntro}
            </p>
            <div className="mt-3 space-y-3">
              {renderParagraphs(p.yourRightsList)}
            </div>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {withContactEmail(p.contactInfo, COLLECTIVE_EMAIL)}
            </p>
            <h3 className="mt-8 font-display text-lg font-semibold">
              {p.supervisoryAuthority}
            </h3>
            <div className="mt-3 space-y-3">
              {renderParagraphs(p.supervisoryAuthorityContent)}
            </div>
          </section>
        </div>
        <p className="mt-10 text-sm text-muted-foreground">
          <Link
            href={`/${otherLang}/privacy`}
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            {otherLabel}
          </Link>
        </p>
      </main>
    </SiteChrome>
  )
}
