"use client"

import { useLanguage } from "@/components/language-provider"
import { getPressMentions, type PressMention } from "@/lib/press-mentions"

function formatMentionDate(dateString: string) {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (full) return `${full[3]}.${full[2]}.${full[1]}`

  const month = /^(\d{4})-(\d{2})$/.exec(dateString)
  if (month) return `${month[2]}.${month[1]}`

  return dateString
}

function PressMentionItem({ mention }: { mention: PressMention }) {
  return (
    <li className="text-muted-foreground leading-relaxed">
      <p>{mention.headline}</p>
      <a
        href={mention.postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-foreground underline underline-offset-2 transition-colors hover:text-primary"
      >
        {mention.source} ({formatMentionDate(mention.date)})
      </a>
    </li>
  )
}

export function PressSection() {
  const { language, translations: t } = useLanguage()
  const mentions = [...getPressMentions(language)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (!mentions.length) return null

  return (
    <section id="media" className="mt-12 scroll-mt-24">
      <h2 className="font-display text-xl font-semibold">{t.press.title}</h2>
      <ul className="mt-3 space-y-3">
        {mentions.map((mention) => (
          <PressMentionItem key={mention.id} mention={mention} />
        ))}
      </ul>
    </section>
  )
}
