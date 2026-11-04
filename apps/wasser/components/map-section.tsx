"use client"

import { useState } from "react"
import { Button } from "@kompass/ui/button"
import { RichText } from "@/components/rich-text"
import { useLanguage } from "@/components/language-provider"
import { MAP_URLS, getMapEmbedUrl } from "@/lib/map"

const sectionShell =
  "flex scroll-mt-[var(--header-offset)] flex-col justify-start px-4 py-14 sm:px-6 sm:py-20 md:min-h-[calc(100svh-var(--header-offset))] md:justify-center"
const contentWide = "mx-auto w-full max-w-6xl xl:max-w-7xl"

export function MapSection({
  titleAs: TitleTag = "h2",
  id = "map",
  muted = false,
}: {
  titleAs?: "h1" | "h2"
  id?: string
  muted?: boolean
}) {
  const { language, translations: t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const embedUrl = getMapEmbedUrl(language)

  const buttons = [
    {
      lang: "en" as const,
      label: t.map.addEnglishMap,
      href: MAP_URLS.ENGLISH_MAP,
      flag: "EN",
    },
    {
      lang: "de" as const,
      label: t.map.addGermanMap,
      href: MAP_URLS.GERMAN_MAP,
      flag: "DE",
    },
    {
      lang: "ru" as const,
      label: t.map.addRussianMap,
      href: MAP_URLS.RUSSIAN_MAP,
      flag: "RU",
    },
  ]

  return (
    <section
      id={id}
      className={`${sectionShell} ${muted ? "bg-section-muted" : ""}`}
    >
      <div className={`${contentWide} animate-[rise_0.55s_ease-out_both]`}>
        <TitleTag className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
          {t.map.heroTitle}
        </TitleTag>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="flex min-h-0 flex-col justify-between gap-8 lg:min-h-[28rem]">
            <RichText
              text={t.map.infoSection}
              className="text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
            <div className="flex flex-wrap gap-3">
              {buttons.map((btn) => (
                <Button
                  key={btn.lang}
                  asChild
                  size="lg"
                  variant={language === btn.lang ? "default" : "outline"}
                  className={
                    language === btn.lang
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-background"
                  }
                >
                  <a href={btn.href} target="_blank" rel="noopener noreferrer">
                    <span className="mr-2 font-medium tabular-nums">{btn.flag}</span>
                    {btn.label}
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <div className="relative h-80 w-full overflow-hidden border border-border bg-muted/40 sm:h-[28rem]">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/40">
                <p className="text-sm text-muted-foreground">{t.map.loadingMap}</p>
              </div>
            )}
            <iframe
              src={embedUrl}
              title={t.map.heroTitle}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              onLoad={() => setLoading(false)}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
