"use client"

import Link from "next/link"
import { Compass } from "lucide-react"
import {
  BrandMark,
  LandingShell,
  SiteFooter,
  SiteHeader,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"

export function AboutPageClient() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`
  const brand = (
    <BrandMark icon={Compass}>
      <span className="text-foreground">{t.brand}</span>
    </BrandMark>
  )

  return (
    <LandingShell
      enableScrollSnap={false}
      header={
        <SiteHeader
          brand={brand}
          homeHref={homeHref}
          links={[
            { type: "section", id: "projects", label: t.navigation.projects },
            { type: "section", id: "about", label: t.navigation.about },
            {
              type: "section",
              id: "supporters",
              label: t.navigation.supporters,
            },
            { type: "section", id: "contact", label: t.navigation.contact },
          ]}
          trailing={<LanguageSwitcher />}
        />
      }
      footer={<SiteFooter brand={brand} notice={t.footer.notice} />}
    >
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em]">
          {t.about.pageTitle}
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
