"use client"

import { useState } from "react"
import { PageSection } from "@kompass/landing"
import { Button } from "@kompass/ui/button"
import { RichText } from "@/components/rich-text"
import { useLanguage } from "@/components/language-provider"
import { MAP_URLS, getMapEmbedUrl } from "@/lib/map"

const MAP_LANGS = [
  {
    lang: "de" as const,
    href: MAP_URLS.GERMAN_MAP,
    labelKey: "addGermanMap" as const,
  },
  {
    lang: "en" as const,
    href: MAP_URLS.ENGLISH_MAP,
    labelKey: "addEnglishMap" as const,
  },
  {
    lang: "ru" as const,
    href: MAP_URLS.RUSSIAN_MAP,
    labelKey: "addRussianMap" as const,
  },
]

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
  const TitleTag = titleAs

  return (
    <>
      <PageSection
        id={id}
        muted={muted}
        fillViewport
        width="wide"
        className="relative overflow-hidden bg-[linear-gradient(165deg,hsl(196_42%_93%)_0%,hsl(195_28%_97%)_38%,hsl(195_20%_98%)_100%)]"
      >
        <div className="text-center">
          <TitleTag className="font-display text-4xl font-semibold leading-[1.12] tracking-[-0.02em] text-foreground sm:text-5xl md:text-[3.25rem]">
            {t.map.heroTitle}
          </TitleTag>
          <p className="mt-8 w-full text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.map.lead}
          </p>
        </div>

        <div className="mt-14 w-full sm:mt-16">
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {MAP_LANGS.map((btn) => {
              const isPrimary = language === btn.lang
              return (
                <Button
                  key={btn.lang}
                  asChild
                  size="lg"
                  variant={isPrimary ? "default" : "outline"}
                  className={
                    isPrimary
                      ? "w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      : "w-full border-border/80 bg-background/70 text-foreground hover:bg-background"
                  }
                >
                  <a
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full justify-center"
                  >
                    {t.map[btn.labelKey]}
                  </a>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Clip My Maps header (title + colored bar) — cannot remove from iframe itself */}
        <div className="relative mt-16 mb-4 h-[min(68vh,38rem)] w-full overflow-hidden rounded-md bg-muted/30 shadow-[0_24px_60px_-28px_hsl(200_40%_30%/0.35)] sm:mt-20 sm:mb-8 sm:h-[min(70vh,44rem)]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[hsl(196_30%_95%)]">
              <p className="text-sm text-muted-foreground">{t.map.loadingMap}</p>
            </div>
          )}
          <iframe
            src={embedUrl}
            title={t.map.heroTitle}
            className={`absolute left-0 w-full border-0 transition-opacity duration-700 ${
              loading ? "opacity-0" : "opacity-100"
            } top-[-72px] h-[calc(100%+72px)]`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            onLoad={() => setLoading(false)}
          />
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
