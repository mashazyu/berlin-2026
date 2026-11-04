"use client"

import { useState } from "react"
import { PageSection } from "@kompass/landing"
import { Button } from "@kompass/ui/button"
import { RichText } from "@/components/rich-text"
import { useLanguage } from "@/components/language-provider"
import { MAP_URLS, getMapEmbedUrl } from "@/lib/map"

export function MapSection({
  titleAs = "h2",
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
  const includes = t.map.includes as string[]
  const howTo = t.map.howTo as string[]

  const buttons = [
    {
      lang: "en" as const,
      label: t.map.addEnglishMap,
      href: MAP_URLS.ENGLISH_MAP,
      flag: "🇬🇧",
    },
    {
      lang: "de" as const,
      label: t.map.addGermanMap,
      href: MAP_URLS.GERMAN_MAP,
      flag: "🇩🇪",
    },
    {
      lang: "ru" as const,
      label: t.map.addRussianMap,
      href: MAP_URLS.RUSSIAN_MAP,
      flag: "🇷🇺",
    },
  ]

  return (
    <PageSection
      id={id}
      title={t.map.heroTitle}
      titleAs={titleAs}
      muted={muted}
      fillViewport
      width="wide"
    >
      <div className="mt-10 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
          <RichText text={t.map.lead} />

          <div>
            <h3 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground sm:text-lg">
              {t.map.includesHeading}
            </h3>
            <ul className="mt-3 list-disc space-y-2 ps-5">
              {includes.map((item) => (
                <li key={item}>
                  <RichText text={item} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground sm:text-lg">
              {t.map.howToHeading}
            </h3>
            <ol className="mt-3 list-decimal space-y-2 ps-5">
              {howTo.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <RichText
            text={t.map.sources}
            className="text-sm leading-relaxed text-muted-foreground sm:text-base"
          />
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

      <div className="mt-10 w-full space-y-3">
        <p className="text-sm font-medium text-foreground">{t.map.saveHint}</p>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
          {buttons.map((btn) => (
            <Button
              key={btn.lang}
              asChild
              size="lg"
              variant={language === btn.lang ? "default" : "outline"}
              className={
                language === btn.lang
                  ? "w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  : "w-full bg-background"
              }
            >
              <a
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full justify-center"
              >
                <span className="mr-2 text-base leading-none" aria-hidden>
                  {btn.flag}
                </span>
                {btn.label}
              </a>
            </Button>
          ))}
        </div>
      </div>
    </PageSection>
  )
}
