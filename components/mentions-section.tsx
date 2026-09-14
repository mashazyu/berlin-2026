"use client"

import { ExternalLink } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { buttonVariants } from "@/components/ui/button"
import { getMentions, type Mention } from "@/lib/mentions"

function formatMentionDate(dateString: string) {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (full) return `${full[3]}.${full[2]}.${full[1]}`

  const month = /^(\d{4})-(\d{2})$/.exec(dateString)
  if (month) return `${month[2]}.${month[1]}`

  return dateString
}

function MentionItem({
  mention,
  openPostLabel,
}: {
  mention: Mention
  openPostLabel: string
}) {
  return (
    <li className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-sm text-muted-foreground">
            {mention.kindLabel} · {mention.source}
          </p>
          <time
            dateTime={mention.date}
            className="text-sm tabular-nums text-muted-foreground sm:hidden"
          >
            {formatMentionDate(mention.date)}
          </time>
        </div>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {mention.topics.map((topic) => (
            <li
              key={topic}
              className="rounded-md border border-border/80 bg-muted/50 px-2 py-0.5 text-[12px] leading-snug text-foreground/80"
            >
              {topic}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <time
          dateTime={mention.date}
          className="hidden text-sm tabular-nums text-muted-foreground sm:inline"
        >
          {formatMentionDate(mention.date)}
        </time>
        <a
          href={mention.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {openPostLabel}
          <ExternalLink className="size-3.5 opacity-70" aria-hidden />
        </a>
      </div>
    </li>
  )
}

export function MentionsSection() {
  const { language, translations: t } = useLanguage()
  const mentions = [...getMentions(language)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (!mentions.length) return null

  return (
    <section id="mentions" className="mt-12 scroll-mt-24">
      <h2 className="font-display text-xl font-semibold">{t.mentions.title}</h2>
      <ul className="mt-4 space-y-5">
        {mentions.map((mention) => (
          <MentionItem
            key={mention.id}
            mention={mention}
            openPostLabel={t.mentions.openPost}
          />
        ))}
      </ul>
    </section>
  )
}
