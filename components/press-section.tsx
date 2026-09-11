"use client"

import Image from "next/image"
import { Calendar } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getPressMentions, type PressMention } from "@/lib/press-mentions"
import { CONTENT_LANGUAGE } from "@/lib/seo/constants"

function formatMentionDate(dateString: string, language: string) {
  const isFullDate = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  const date = isFullDate
    ? new Date(`${dateString}T12:00:00`)
    : new Date(dateString)

  return date.toLocaleDateString(
    CONTENT_LANGUAGE[language as keyof typeof CONTENT_LANGUAGE] ?? "en-DE",
    isFullDate
      ? { year: "numeric", month: "long", day: "numeric" }
      : { year: "numeric", month: "long" }
  )
}

function PressMentionTile({ mention }: { mention: PressMention }) {
  const { language } = useLanguage()

  return (
    <article className="flex h-full flex-col rounded-xl border border-border bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted/50">
          {mention.image ? (
            <Image
              src={mention.image}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
            {mention.channel}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" aria-hidden />
            <time dateTime={mention.date}>
              {formatMentionDate(mention.date, language)}
            </time>
          </div>
        </div>
      </div>

      <a
        href={mention.postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground transition-colors hover:text-primary"
      >
        {mention.summary}
      </a>
    </article>
  )
}

export function PressSection() {
  const { language, translations: t } = useLanguage()
  const mentions = [...getPressMentions(language)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (!mentions.length) return null

  return (
    <section
      id="media"
      className="scroll-mt-[4.25rem] bg-section-muted px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="section-title font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {t.press.title}
        </h2>
        <p className="mt-1 text-base leading-relaxed text-muted-foreground">
          {t.press.subtitle}
        </p>
      </div>

      <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 sm:gap-4">
        {mentions.map((mention) => (
          <PressMentionTile key={mention.id} mention={mention} />
        ))}
      </div>
    </section>
  )
}
