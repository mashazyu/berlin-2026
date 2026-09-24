"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LANGUAGES, type Language } from "@/lib/i18n"
import { useLanguage } from "@/components/language-provider"
import { selectionChipClassName } from "@kompass/ui/lib/chip-styles"

const LABELS: Record<Language, string> = {
  en: "EN",
  de: "DE",
}

export function LanguageSwitcher() {
  const { language, translations: t } = useLanguage()
  const pathname = usePathname()

  function hrefFor(next: Language) {
    const parts = pathname.split("/")
    if (parts.length >= 2) parts[1] = next
    return parts.join("/") || `/${next}`
  }

  return (
    <div
      className="flex items-center gap-1"
      role="navigation"
      aria-label={t.languageSwitcher.label}
    >
      {LANGUAGES.map((lang) => (
        <Link
          key={lang}
          href={hrefFor(lang)}
          className={selectionChipClassName(lang === language)}
          hrefLang={lang}
          aria-current={lang === language ? "true" : undefined}
        >
          {LABELS[lang]}
        </Link>
      ))}
    </div>
  )
}
