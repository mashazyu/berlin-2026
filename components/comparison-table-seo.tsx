import { getTranslations } from "@/lib/i18n/get-translations"
import type { Language } from "@/lib/i18n/types"
import { cellKey } from "@/lib/comparison/cell-key"
import { groupTopics } from "@/lib/comparison/groups"
import type { ResolvedComparison } from "@/lib/comparison/types"
import { renderParagraphs } from "@/lib/utils"

/**
 * Crawlable comparison HTML: stance summaries only (no source quotes).
 * Quotes stay on the client JSON fetch to keep ISR/FOT payloads smaller.
 * Passed as a Server Component slot — not as Client Component props.
 */
export function ComparisonTableSeo({
  comparison,
  language,
}: {
  comparison: ResolvedComparison
  language: Language
}) {
  const t = getTranslations(language)
  const { parties, topics, cellsByKey } = comparison
  const topicGroups = groupTopics(topics)

  return (
    <section id="comparison" className="scroll-mt-[4.25rem] bg-white px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="section-title font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {t.comparison.title}
        </h2>
        <div className="mt-1 space-y-2 text-base">
          {renderParagraphs(
            t.comparison.subtitle,
            "text-muted-foreground leading-relaxed",
            language,
          )}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-8">
        {topicGroups.map(({ group, topics: groupTopicsList }) => {
          if (!groupTopicsList.length) return null
          return (
            <section key={group} aria-labelledby={`seo-group-${group}`}>
              <h3
                id={`seo-group-${group}`}
                className="font-display text-xl font-semibold text-foreground"
              >
                {t.comparison.groups[group]}
              </h3>
              <div className="mt-3 space-y-6">
                {groupTopicsList.map((topic) => (
                  <article key={topic.id}>
                    <h4 className="text-base font-semibold text-foreground">
                      {topic.displayLabel}
                    </h4>
                    <dl className="mt-2 space-y-3">
                      {parties.map((party) => {
                        const cell =
                          cellsByKey[cellKey(topic.id, party.id)]
                        const summary = cell?.summary?.trim() ?? ""
                        return (
                          <div key={party.id}>
                            <dt className="text-sm font-semibold text-foreground">
                              {party.displayName || party.shortName}
                            </dt>
                            <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                              {summary || t.comparison.emptyCell}
                            </dd>
                          </div>
                        )
                      })}
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </section>
  )
}
