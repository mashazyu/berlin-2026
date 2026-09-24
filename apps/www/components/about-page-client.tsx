"use client"

import Link from "next/link"
import {
  LandingShell,
  SiteFooter,
  SiteHeader,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"

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
            { type: "section", id: "projects", label: t.navigation.projects },
            { type: "section", id: "contacts", label: t.navigation.contacts },
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
          {t.about.title}
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          {t.about.body}
        </p>
        <p className="mt-8">
          <Link
            href={homeHref}
            className="text-primary underline-offset-4 hover:underline"
          >
            ← {t.brand}
          </Link>
        </p>
      </section>
    </LandingShell>
  )
}
