"use client"

import {
  ContentSection,
  Hero,
  HeroCta,
  HeroScrollHint,
  LandingShell,
  MentionsSection,
  SiteFooter,
  SiteHeader,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { getMentions } from "@/lib/mentions"

export function HomePageClient() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`
  const aboutHref = `/${language}/about`

  return (
    <LandingShell
      header={
        <SiteHeader
          brand={
            <>
              <span className="text-accent">{t.brandAccent}</span>
              <span className="mx-1 text-border">·</span>
              <span className="text-foreground">{t.brandRest}</span>
            </>
          }
          homeHref={homeHref}
          links={[
            { type: "section", id: "content", label: t.navigation.overview },
            { type: "page", href: aboutHref, label: t.navigation.about },
          ]}
          trailing={<LanguageSwitcher />}
        />
      }
      footer={
        <SiteFooter
          brand={
            <>
              <span className="text-accent">{t.brandAccent}</span>
              <span className="mx-1 text-border">·</span>
              <span className="text-foreground">{t.brandRest}</span>
            </>
          }
          notice={t.footer.notice}
          links={[
            { href: aboutHref, label: t.footer.about },
            { href: "mailto:hello@example.com", label: t.footer.contact },
          ]}
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
            href="#content"
            sectionId="content"
          />
        }
        scrollHint={
          <HeroScrollHint
            label={t.hero.scrollHint}
            href="#content"
            sectionId="content"
          />
        }
      />
      <ContentSection
        id="content"
        title={t.content.title}
        blocks={t.content.blocks.map((block) => ({
          title: block.title,
          body: <p>{block.body}</p>,
        }))}
      />
      <MentionsSection
        title={t.mentions.title}
        mentions={getMentions(language)}
      />
    </LandingShell>
  )
}
