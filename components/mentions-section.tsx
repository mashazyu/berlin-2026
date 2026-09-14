"use client"

import { ExternalLink } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
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
  linkLabel,
}: {
  mention: Mention
  linkLabel: string
}) {
  return (
    <li className="flex gap-3">
      {mention.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- small external/local mention logos
        <img
          src={mention.logo}
          alt=""
          width={28}
          height={28}
          className="mt-0.5 size-7 shrink-0 rounded-sm object-cover"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className="text-sm text-muted-foreground">
            {mention.kindLabel} · {mention.source}
          </p>
          <time
            dateTime={mention.date}
            className="text-sm tabular-nums text-muted-foreground"
          >
            {formatMentionDate(mention.date)}
          </time>
        </div>
        <a
          href={mention.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block rounded-sm text-foreground/80 transition-colors hover:text-primary"
          title={linkLabel}
        >
          <span className="text-[15px] leading-snug">„{mention.headline}“</span>
          <ExternalLink
            className="ms-1 inline h-3.5 w-3.5 shrink-0 align-text-bottom opacity-60"
            aria-hidden
          />
          <span className="sr-only">{linkLabel}</span>
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
      <ul className="mt-4 space-y-4">
        {mentions.map((mention) => (
          <MentionItem
            key={mention.id}
            mention={mention}
            linkLabel={t.comparison.sourceQuoteLink}
          />
        ))}
      </ul>
    </section>
  )
}
