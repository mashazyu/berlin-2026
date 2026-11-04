"use client"

import {
  Hero,
  HeroCta,
  HeroScrollHint,
} from "@kompass/landing"
import { Button } from "@kompass/ui/button"
import { SiteChrome } from "@/components/site-chrome"
import { MapSection } from "@/components/map-section"
import { FaqSection } from "@/components/faq-section"
import { useLanguage } from "@/components/language-provider"

export function HomePageClient() {
  const { language, translations: t } = useLanguage()

  return (
    <SiteChrome enableScrollSnap>
      <Hero
        headline={t.hero.headline}
        support={t.hero.support}
        blurb={t.hero.blurb}
        disclaimer={t.hero.disclaimer}
        cta={
          <div className="flex flex-wrap items-center gap-3">
            <HeroCta label={t.hero.ctaMap} href="#map" sectionId="map" />
            <Button asChild size="lg" variant="outline" className="bg-background">
              <a href={`/${language}/faq`}>{t.hero.ctaFaq}</a>
            </Button>
          </div>
        }
        scrollHint={
          <HeroScrollHint
            label={t.hero.scrollHint}
            href="#map"
            sectionId="map"
          />
        }
      />

      <MapSection muted />
      <FaqSection titleAs="h2" />
    </SiteChrome>
  )
}
