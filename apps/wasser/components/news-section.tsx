"use client"

import { PageSection } from "@kompass/landing"
import { metaTagClassName } from "@kompass/ui/lib/chip-styles"
import { Carousel, CarouselSlide } from "@/components/carousel"
import { RichText } from "@/components/rich-text"
import { useLanguage } from "@/components/language-provider"

type NewsItem = {
  id: number
  title: string
  content: string
  date: string
  project: number[]
}

function formatNewsDate(dateString: string, language: string) {
  const locale =
    language === "de" ? "de-DE" : language === "ru" ? "ru-RU" : "en-US"
  const normalized =
    /^\d{4}-\d{2}$/.test(dateString) ? `${dateString}-01` : dateString
  return new Date(normalized).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
  })
}

function NewsCard({
  item,
  language,
  tags,
}: {
  item: NewsItem
  language: string
  tags: { map: string; fountains: string }
}) {
  return (
    <article id={`news-${item.id}`} className="scroll-mt-24 h-full">
      <div className="flex flex-wrap gap-2">
        {item.project.map((projectId) => (
          <span key={projectId} className={metaTagClassName()}>
            {projectId === 1 ? tags.map : tags.fountains}
          </span>
        ))}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
        {item.title}
      </h3>
      <time
        dateTime={item.date}
        className="mt-1 block text-sm tabular-nums text-muted-foreground"
      >
        {formatNewsDate(item.date, language)}
      </time>
      <RichText
        text={item.content.replaceAll("{lang}", language)}
        className="mt-3 text-base leading-relaxed text-muted-foreground"
      />
    </article>
  )
}

export function NewsSection({
  id = "news",
  titleAs = "h2",
  muted = false,
  layout = "carousel",
}: {
  id?: string
  titleAs?: "h1" | "h2"
  muted?: boolean
  layout?: "grid" | "carousel"
}) {
  const { language, translations: t } = useLanguage()
  const news = [...(t.news as NewsItem[])].sort((a, b) => {
    const stamp = (d: string) =>
      new Date(/^\d{4}-\d{2}$/.test(d) ? `${d}-01` : d).getTime()
    const byDate = stamp(b.date) - stamp(a.date)
    if (byDate !== 0) return byDate
    return b.id - a.id
  })
  const tags = t.newsTags as { map: string; fountains: string }
  const title = t.newsSection.title

  return (
    <PageSection
      id={id}
      title={title}
      titleAs={titleAs}
      muted={muted}
      width="wide"
    >
      {layout === "carousel" ? (
        <div className="mt-10">
          <Carousel
            label={title}
            previousLabel={t.carousel.previous}
            nextLabel={t.carousel.next}
          >
            {news.map((item) => (
              <CarouselSlide key={item.id}>
                <div className="h-full border-b border-border pb-6">
                  <NewsCard item={item} language={language} tags={tags} />
                </div>
              </CarouselSlide>
            ))}
          </Carousel>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8">
          {news.map((item) => (
            <li key={item.id} className="border-b border-border pb-8">
              <NewsCard item={item} language={language} tags={tags} />
            </li>
          ))}
        </ul>
      )}
    </PageSection>
  )
}
