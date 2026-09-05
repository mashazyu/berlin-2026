"use client"

import { useLanguage } from "@/components/language-provider"
import { renderParagraphs } from "@/lib/utils"

const BLOCKS = [
  ["berlinVotesTitle", "berlinVotesBody"],
  ["accessibilityTitle", "accessibilityBody"],
  ["clarityTitle", "clarityBody"],
  ["whatWeDidTitle", "whatWeDidBody"],
] as const

export function MotivationSection() {
  const { language, translations: t } = useLanguage()
  const m = t.motivation

  return (
    <section id="motivation" className="scroll-mt-[4.25rem] bg-section-muted px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl animate-[rise_0.55s_ease-out_both]">
        <h2 className="section-title font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {m.title}
        </h2>
        <div className="space-y-10">
          {BLOCKS.map(([titleKey, bodyKey]) => (
            <div key={titleKey}>
              <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
                {m[titleKey]}
              </h3>
              <div className="mt-3 space-y-3 text-base">
                {renderParagraphs(m[bodyKey], "text-muted-foreground leading-relaxed", language)}
              </div>
            </div>
          ))}

          <div>
            <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
              {m.beforeYouVoteTitle}
            </h3>
            <div className="mt-3 space-y-3 text-base">
              {renderParagraphs(m.beforeYouVoteBody, "text-muted-foreground leading-relaxed", language)}
              {renderParagraphs(m.furtherReadingIntro, "text-muted-foreground leading-relaxed", language)}
              {renderParagraphs(m.furtherReadingBody, "text-muted-foreground leading-relaxed", language)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
