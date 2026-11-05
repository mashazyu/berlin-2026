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
  const includes = t.map.includes as { label: string; detail: string }[]
  const howTo = t.map.howTo as { label: string; detail: string }[]

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
    <>
      <PageSection
        id={id}
        title={t.map.heroTitle}
        titleAs={titleAs}
        muted={muted}
        fillViewport
        width="wide"
      >
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {t.map.lead}
        </p>

        <div className="relative mt-8 h-[min(70vh,36rem)] w-full overflow-hidden border border-border bg-muted/40 sm:h-[min(72vh,42rem)]">
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

        <div className="mt-8 w-full">
          <p className="font-display text-base font-semibold tracking-[-0.01em] text-foreground sm:text-lg">
            {t.map.saveHint}
          </p>
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
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

      <PageSection id="about-map" muted={!muted} fillViewport width="wide">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
              {t.map.includesHeading}
            </h2>
            <ul className="mt-6 space-y-4 text-base leading-relaxed sm:text-lg">
              {includes.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-foreground">{item.label}</span>
                  <span className="text-muted-foreground"> — {item.detail}</span>
                </li>
              ))}
            </ul>
            <RichText
              text={t.map.sources}
              className="mt-6 text-sm text-muted-foreground/80"
            />
          </div>

          <div>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
              {t.map.howToHeading}
            </h2>
            <ul className="mt-6 space-y-4 text-base leading-relaxed sm:text-lg">
              {howTo.map((step) => (
                <li key={step.label}>
                  <span className="font-medium text-foreground">{step.label}</span>
                  <span className="text-muted-foreground"> — {step.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </PageSection>
    </>
  )
}
