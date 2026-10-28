"use client"

import type { ReactNode } from "react"
import { Compass } from "lucide-react"
import {
  BrandMark,
  LandingShell,
  SiteFooter,
  SiteHeader,
  type FooterLink,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { legalLanguageFor } from "@/lib/i18n"

const NAV_SECTIONS = [
  "projects",
  "about",
  "supporters",
  "contact",
] as const

export function useSiteChrome() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`
  const legalLang = legalLanguageFor(language)
  const brand = (
    <BrandMark icon={Compass}>
      <span className="text-foreground">{t.brand}</span>
    </BrandMark>
  )

  const footerLinks: FooterLink[] = [
    {
      href: `/${language}/ai-disclosure`,
      label: t.footer.aiDisclosure,
    },
    {
      href: `/${legalLang}/impressum`,
      label: t.footer.impressum,
    },
    {
      href: `/${legalLang}/privacy`,
      label: t.footer.privacy,
    },
  ]

  return {
    language,
    t,
    homeHref,
    brand,
    header: (
      <SiteHeader
        brand={brand}
        homeHref={homeHref}
        links={NAV_SECTIONS.map((id) => ({
          type: "section" as const,
          id,
          label: t.navigation[id],
        }))}
        trailing={<LanguageSwitcher />}
      />
    ),
    footer: (
      <SiteFooter
        brand={brand}
        notice={t.footer.aiNotice}
        links={footerLinks}
      />
    ),
  }
}

export function SiteChrome({
  children,
  enableScrollSnap = false,
}: {
  children: ReactNode
  enableScrollSnap?: boolean
}) {
  const { header, footer } = useSiteChrome()
  return (
    <LandingShell
      enableScrollSnap={enableScrollSnap}
      header={header}
      footer={footer}
    >
      {children}
    </LandingShell>
  )
}
