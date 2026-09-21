import { getTranslations } from "@/lib/i18n/get-translations"
import type { Language } from "@/lib/i18n/types"
import { cellKey } from "@/lib/comparison/cell-key"
import { groupTopics } from "@/lib/comparison/groups"
import type { ResolvedComparison } from "@/lib/comparison/types"
import { renderParagraphs } from "@/lib/utils"

/**
 * Server-rendered, crawlable comparison markup. Kept out of Client Component props
 * so the dataset is not duplicated into the RSC flight payload for hydration.
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
    <section
      id="comparison"
      className="scroll-mt-[4.25rem] bg-white px-4 py-16 sm:px-6 sm:py-20"
    >
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

      <div className="mx-auto mt-10 max-w-3xl space-y-10">
        {topicGroups.map(({ group, topics: groupTopicsList }) => {
          if (!groupTopicsList.length) return null
          const groupLabel = t.comparison.groups[group]
          return (
            <section key={group} aria-labelledby={`seo-group-${group}`}>
              <h3
                id={`seo-group-${group}`}
                className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground"
              >
                {groupLabel}
              </h3>
              <div className="mt-4 space-y-8">
                {groupTopicsList.map((topic) => (
                  <article key={topic.id} aria-labelledby={`seo-topic-${topic.id}`}>
                    <h4
                      id={`seo-topic-${topic.id}`}
                      className="text-base font-semibold text-foreground"
                    >
                      {topic.displayLabel}
                    </h4>
                    <ul className="mt-3 space-y-4">
                      {parties.map((party) => {
                        const cell =
                          cellsByKey[cellKey(topic.id, party.id)]
                        const summary = cell?.summary?.trim() ?? ""
                        const href =
                          cell?.programHref || party.programUrl || undefined
                        return (
                          <li key={party.id}>
                            <p className="text-sm font-semibold text-foreground">
                              {party.displayName || party.shortName}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {summary || t.comparison.emptyCell}
                            </p>
                            {cell?.sourceQuotes?.length ? (
                              <ul className="mt-2 space-y-2">
                                {cell.sourceQuotes.map((item) => (
                                  <li key={item.quote}>
                                    <blockquote className="text-sm text-foreground/80">
                                      <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-primary"
                                      >
                                        „{item.quote}“
                                      </a>
                                    </blockquote>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {href ? (
                              <p className="mt-1">
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline"
                                >
                                  {t.comparison.openProgram}
                                </a>
                              </p>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
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
