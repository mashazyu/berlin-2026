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
        "inline-flex items-center gap-0.5 rounded-full border border-border/80 bg-white/70 p-1 shadow-sm backdrop-blur-sm",
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
            "rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-all duration-200",
            language === lang
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={language === lang}
        >
          {LABELS[lang]}
        </button>
      ))}
      {/* Keep crawlable alternates */}
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
