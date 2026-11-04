"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

const sectionShell =
  "flex scroll-mt-[var(--header-offset)] flex-col justify-start bg-section-muted px-4 py-14 sm:px-6 sm:py-20"
const contentWide = "mx-auto w-full max-w-6xl xl:max-w-7xl"

/** Matches water4all QuickHelpSection: label by source id, hash by display index. */
const QUICK_LINKS = [
  { sourceId: "faq3", hash: "faq3" },
  { sourceId: "faq10", hash: "faq10" },
  { sourceId: "faq9", hash: "faq9" },
  { sourceId: "faq12", hash: "faq12" },
  { sourceId: "faq11", hash: "faq11" },
  { sourceId: "faq5", hash: "faq5" },
] as const

export function QuickHelpLinks() {
  const { language, translations: t } = useLanguage()
  const questions = t.faq.questions as Array<{ id: string; question: string }>

  function labelFor(id: string) {
    return questions.find((q) => q.id === id)?.question ?? id
  }

  return (
    <section className={sectionShell}>
      <div className={`${contentWide} animate-[rise_0.55s_ease-out_both]`}>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
          {t.map.quickHelpTitle}
        </h2>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {QUICK_LINKS.map(({ sourceId, hash }) => (
            <li key={sourceId}>
              <Link
                href={`/${language}/faq#${hash}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {labelFor(sourceId)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
