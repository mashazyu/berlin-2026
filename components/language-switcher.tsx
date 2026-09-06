"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SUPPORTED_LANGUAGES, type Language } from "@/lib/i18n/get-translations"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

const LABELS: Record<Language, string> = {
  en: "EN",
  de: "DE",
  ru: "RU",
  tr: "TR",
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(lang: Language) {
    if (lang === language) return
    setLanguage(lang)
    const segments = pathname.split("/")
    if (SUPPORTED_LANGUAGES.includes(segments[1] as Language)) {
      segments[1] = lang
      router.push(segments.join("/") || `/${lang}`)
    } else {
      router.push(`/${lang}`)
    }
  }

  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-border bg-muted/40 p-0.5",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchTo(lang)}
          className={cn(
            "inline-flex h-8 min-w-8 items-center justify-center rounded-[5px] px-2 text-xs font-semibold tracking-wide transition-colors",
            language === lang
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={language === lang}
        >
          {LABELS[lang]}
        </button>
      ))}
      <span className="sr-only">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <Link key={lang} href={`/${lang}`}>
            {LABELS[lang]}
          </Link>
        ))}
      </span>
    </div>
  )
}
