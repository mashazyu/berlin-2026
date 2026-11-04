"use client"

import type { LucideIcon } from "lucide-react"
import { BrandMark } from "./brand-mark"
import { SiteFooter } from "./site-footer"

const DEFAULT_ORIGIN = "https://kompass.berlin"

type FooterCopy = {
  aiNotice: string
  aiDisclosure: string
  impressum: string
  privacy: string
}

const COPY: Record<"de" | "en" | "ru", FooterCopy> = {
  en: {
    aiNotice: "Content on this site was created with AI assistance.",
    aiDisclosure: "AI disclosure",
    impressum: "Legal notice",
    privacy: "Privacy",
  },
  de: {
    aiNotice: "Inhalte auf dieser Website entstanden mit KI-Unterstützung.",
    aiDisclosure: "KI-Hinweis",
    impressum: "Impressum",
    privacy: "Datenschutz",
  },
  ru: {
    aiNotice: "Контент на этом сайте создан с помощью ИИ.",
    aiDisclosure: "Об использовании ИИ",
    impressum: "Выходные данные",
    privacy: "Защита данных",
  },
}

function resolveCopy(language: string): FooterCopy {
  if (language === "en" || language === "ru") return COPY[language]
  return COPY.de
}

function legalLanguageFor(language: string): "de" | "en" {
  return language === "en" ? "en" : "de"
}

export type FooterProps = {
  /** Site / product icon (from the calling app). */
  icon: LucideIcon
  /** Site / product name (from the calling app). */
  name: string
  /** UI language of the current app (de/en/ru/…). */
  language: string
  /**
   * Origin for legal links. Defaults to https://kompass.berlin.
   * Pass "" on www so links stay same-origin (relative).
   */
  origin?: string
}

/**
 * Shared footer for every site in the monorepo.
 * Icon + name come from the app; AI notice + legal links are shared.
 */
export function Footer({
  icon,
  name,
  language,
  origin = DEFAULT_ORIGIN,
}: FooterProps) {
  const copy = resolveCopy(language)
  const legalLang = legalLanguageFor(language)
  const disclosureLang = language === "en" || language === "ru" ? language : "de"
  const base = origin.replace(/\/$/, "")
  const path = (p: string) => (base ? `${base}${p}` : p)
  const external = Boolean(base)

  const brand = (
    <BrandMark icon={icon} iconClassName="h-4 w-4">
      <span className="text-foreground">{name}</span>
    </BrandMark>
  )

  return (
    <SiteFooter
      brand={brand}
      notice={copy.aiNotice}
      links={[
        {
          href: path(`/${disclosureLang}/ai-disclosure`),
          label: copy.aiDisclosure,
          external,
        },
        {
          href: path(`/${legalLang}/impressum`),
          label: copy.impressum,
          external,
        },
        {
          href: path(`/${legalLang}/privacy`),
          label: copy.privacy,
          external,
        },
      ]}
    />
  )
}
