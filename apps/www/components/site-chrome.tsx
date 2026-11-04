"use client"

import type { ReactNode } from "react"
import { Compass } from "lucide-react"
import {
  BrandMark,
  Footer,
  LandingShell,
  SiteHeader,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"

const NAV_SECTIONS = [
  "projects",
  "about",
  "supporters",
  "contact",
] as const

export function useSiteChrome() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`
  const brand = (
    <BrandMark icon={Compass}>
      <span className="text-foreground">{t.brand}</span>
    </BrandMark>
  )

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
    footer: <Footer language={language} origin="" />,
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
