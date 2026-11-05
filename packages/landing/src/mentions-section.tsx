"use client"

import { ExternalLink, Mail, Send } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { metaTagClassName } from "@kompass/ui/lib/chip-styles"

export type MentionKind = "telegram" | "newsletter" | "substack" | "article"

export type MentionItem = {
  id: string
  date: string
  postUrl: string
  kind: MentionKind
  source: string
  topics: string[]
  kindLabel: string
}

function SubstackIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  )
}

/** Two-column broadsheet — clearer than Lucide Newspaper at 16px. */
function NewspaperIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M12 4v16" />
      <path d="M6 8h3.5M6 11h3.5M6 14h3.5" />
      <path d="M14.5 8H18M14.5 11H18M14.5 14H18M14.5 17H18" />
    </svg>
  )
}

const KIND_ICONS: Record<
  MentionKind,
  LucideIcon | typeof SubstackIcon | typeof NewspaperIcon
> = {
  telegram: Send,
  newsletter: Mail,
  substack: SubstackIcon,
  article: NewspaperIcon,
}

function formatMentionDate(dateString: string) {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (full) return `${full[3]}.${full[2]}.${full[1]}`

  const month = /^(\d{4})-(\d{2})$/.exec(dateString)
  if (month) return `${month[2]}.${month[1]}`

  return dateString
}

function MentionRow({ mention }: { mention: MentionItem }) {
  const KindIcon = KIND_ICONS[mention.kind]
  const tags = mention.topics.slice(0, 2)

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <a
        href={mention.postUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex min-w-0 max-w-full items-center gap-2 text-foreground transition-colors hover:text-primary"
        title={mention.kindLabel}
      >
        <KindIcon
          className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
          aria-hidden
        />
        <span className="truncate font-medium">{mention.source}</span>
        <ExternalLink
          className="size-3.5 shrink-0 opacity-50 transition-opacity group-hover:opacity-80"
          aria-hidden
        />
        <span className="sr-only">({mention.kindLabel})</span>
      </a>
      {tags.length > 0 ? (
        <ul className="ms-6 flex flex-wrap gap-2">
          {tags.map((topic) => (
            <li key={topic} className={metaTagClassName()}>
              {topic}
            </li>
          ))}
        </ul>
      ) : null}
      <time
        dateTime={mention.date}
        className="ms-auto text-sm tabular-nums text-muted-foreground"
      >
        {formatMentionDate(mention.date)}
      </time>
    </li>
  )
}

export type MentionsSectionProps = {
  id?: string
  title: string
  mentions: MentionItem[]
}

export function MentionsSection({
  id = "mentions",
  title,
  mentions,
}: MentionsSectionProps) {
  const sorted = [...mentions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (!sorted.length) return null

  return (
    <section id={id} className="mt-12 scroll-mt-24 px-4 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <ul className="mt-4 space-y-4">
          {sorted.map((mention) => (
            <MentionRow key={mention.id} mention={mention} />
          ))}
        </ul>
      </div>
    </section>
  )
}
