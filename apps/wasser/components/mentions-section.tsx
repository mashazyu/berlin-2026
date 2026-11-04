"use client"

import { ExternalLink, FileText, Mail, Send } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { PageSection } from "@kompass/landing"
import type { MentionItem, MentionKind } from "@kompass/landing"
import { Carousel, CarouselSlide } from "@/components/carousel"
import { useLanguage } from "@/components/language-provider"
import { getMentions } from "@/lib/mentions"

const KIND_ICONS: Record<MentionKind, LucideIcon> = {
  telegram: Send,
  newsletter: Mail,
  substack: FileText,
  article: FileText,
}

function formatMentionDate(dateString: string) {
  const full = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (full) return `${full[3]}.${full[2]}.${full[1]}`
  const month = /^(\d{4})-(\d{2})$/.exec(dateString)
  if (month) return `${month[2]}.${month[1]}`
  return dateString
}

function MentionCard({ mention }: { mention: MentionItem }) {
  const KindIcon = KIND_ICONS[mention.kind]
  const summary = mention.topics[0]

  return (
    <article className="h-full">
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
      <time
        dateTime={mention.date}
        className="mt-2 block text-sm tabular-nums text-muted-foreground"
      >
        {formatMentionDate(mention.date)}
      </time>
      {summary ? (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {summary}
        </p>
      ) : null}
    </article>
  )
}

export function MentionsSection({
  muted = true,
  layout = "list",
}: {
  muted?: boolean
  layout?: "list" | "carousel"
}) {
  const { translations: t, language } = useLanguage()
  const mentions = [...getMentions(language)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (!mentions.length) return null

  return (
    <PageSection
      id="mentions"
      title={t.mentions.title}
      muted={muted}
      width="wide"
    >
      {t.mentions.subtitle ? (
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t.mentions.subtitle}
        </p>
      ) : null}

      {layout === "carousel" ? (
        <div className="mt-8">
          <Carousel
            label={t.mentions.title}
            previousLabel={t.carousel.previous}
            nextLabel={t.carousel.next}
          >
            {mentions.map((mention) => (
              <CarouselSlide key={mention.id}>
                <div className="h-full border-b border-border pb-6">
                  <MentionCard mention={mention} />
                </div>
              </CarouselSlide>
            ))}
          </Carousel>
        </div>
      ) : (
        <ul className="mt-8 max-w-3xl">
          {mentions.map((mention) => (
            <li key={mention.id} className="border-b border-border py-5">
              <MentionCard mention={mention} />
            </li>
          ))}
        </ul>
      )}
    </PageSection>
  )
}
