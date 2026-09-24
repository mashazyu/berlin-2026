"use client"

import {
  Hero,
  HeroCta,
  HeroScrollHint,
  LandingShell,
  SiteFooter,
  SiteHeader,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { guideHref, KOMPASS_HOME } from "@/lib/links"

export function HomePageClient() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`
  const guideUrl = guideHref(language)

  return (
    <LandingShell
      header={
        <SiteHeader
          brand={<span className="text-foreground">{t.brand}</span>}
          homeHref={homeHref}
          links={[
            { type: "section", id: "guides", label: t.navigation.guides },
            {
              type: "external",
              href: KOMPASS_HOME,
              label: t.navigation.about,
            },
          ]}
          trailing={<LanguageSwitcher />}
        />
      }
      footer={
        <SiteFooter
          brand={<span className="text-foreground">{t.brand}</span>}
          notice={t.footer.notice}
        />
      }
    >
      <Hero
        headline={t.hero.headline}
        support={t.hero.support}
        blurb={t.hero.blurb}
        disclaimer={t.hero.disclaimer}
        cta={
          <HeroCta
            label={t.hero.cta}
            href="#guides"
            sectionId="guides"
          />
        }
        scrollHint={
          <HeroScrollHint
            label={t.hero.scrollHint}
            href="#guides"
            sectionId="guides"
          />
        }
      />

      <section
        id="guides"
        className="scroll-mt-[4.25rem] bg-white px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl animate-[rise_0.55s_ease-out_both]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {t.guides.title}
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>{t.guides.intro}</p>
            <p>{t.guides.body}</p>
            <p>{t.guides.note}</p>
          </div>
          <p className="mt-8">
            <a
              href={guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              {t.guides.linkLabel}
            </a>
          </p>
        </div>
      </section>
    </LandingShell>
  )
}
