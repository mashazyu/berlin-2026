"use client"

import type { ReactNode } from "react"
import { Droplet } from "lucide-react"
import {
  BrandMark,
  Footer,
  LandingShell,
  SiteHeader,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { kompassAboutHref } from "@/lib/links"

export function SiteChrome({
  children,
  enableScrollSnap = false,
}: {
  children: ReactNode
  enableScrollSnap?: boolean
}) {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`
  const brand = (
    <BrandMark icon={Droplet}>
      <span className="text-foreground">{t.brand}</span>
    </BrandMark>
  )

  return (
    <LandingShell
      enableScrollSnap={enableScrollSnap}
      header={
        <SiteHeader
          brand={brand}
          homeHref={homeHref}
          links={[
            {
              type: "page",
              href: `/${language}/faq`,
              label: t.navigation.faq,
              matchPath: "/faq",
            },
            {
              type: "external",
              href: kompassAboutHref(language),
              label: t.navigation.about,
            },
          ]}
          trailing={<LanguageSwitcher />}
        />
      }
      footer={
        <Footer icon={Droplet} name={t.brand} language={language} />
      }
    >
      {children}
    </LandingShell>
  )
}
