"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Language } from "@/lib/i18n/types"
import { SUPPORTED_LANGUAGES } from "@/lib/seo/constants"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

const LABELS: Record<Language, string> = {
  en: "EN",
  de: "DE",
  tr: "TR",
  pl: "PL",
  ru: "RU",
  uk: "UK",
  ar: "AR",
}

function alternatePath(pathname: string, lang: Language): string {
  const segments = pathname.split("/")
  if (SUPPORTED_LANGUAGES.includes(segments[1] as Language)) {
    segments[1] = lang
    return segments.join("/") || `/${lang}`
  }
  return `/${lang}`
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-border bg-muted/40 p-0.5",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {SUPPORTED_LANGUAGES.map((lang) => {
        const href = alternatePath(pathname, lang)
        const active = lang === language
        return (
          <Link
            key={lang}
            href={href}
            hrefLang={lang}
            aria-current={active ? "page" : undefined}
            onClick={() => {
              if (!active) setLanguage(lang)
            }}
            className={cn(
              "inline-flex h-8 min-w-8 items-center justify-center rounded-[5px] px-2 text-xs font-semibold tracking-wide transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {LABELS[lang]}
          </Link>
        )
      })}
    </div>
  )
}
