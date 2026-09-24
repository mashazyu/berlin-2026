"use client"

import {
  LandingShell,
  SiteFooter,
  SiteHeader,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { KOMPASS_HOME } from "@/lib/links"

/** Legacy route — About now points to kompass.berlin. */
export function AboutPageClient() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`

  return (
    <LandingShell
      enableScrollSnap={false}
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
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em]">
          {t.navigation.about}
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          <a
            href={KOMPASS_HOME}
            className="text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            kompass.berlin
          </a>
        </p>
      </section>
    </LandingShell>
  )
}
