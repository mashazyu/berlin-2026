"use client"

import { useEffect, useId, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import type { Language } from "@/lib/i18n/types"
import { SUPPORTED_LANGUAGES } from "@/lib/seo/constants"
import { useLanguage } from "@/components/language-provider"
import { cn } from "@/lib/utils"

const LABELS: Record<Language, string> = {
  en: "EN",
  de: "DE",
  tr: "TR",
  ku: "KU",
  vi: "VI",
  pl: "PL",
  ru: "RU",
  uk: "UK",
  ar: "AR",
  es: "ES",
  it: "IT",
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
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const root = rootRef.current
      if (!root || !(event.target instanceof Node)) return
      if (!root.contains(event.target)) setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("touchstart", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("touchstart", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div ref={rootRef} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        className="inline-flex h-9 items-center gap-1 rounded-md border border-border bg-muted/40 px-2.5 text-xs font-semibold tracking-wide text-foreground transition-colors hover:bg-muted"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        aria-label="Language"
        onClick={() => setOpen((value) => !value)}
      >
        {LABELS[language]}
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label="Language"
        className={cn(
          "absolute end-0 top-[calc(100%+0.35rem)] z-50 min-w-[7.5rem] rounded-md border border-border bg-white p-1 shadow-md",
          !open && "hidden"
        )}
      >
        <div className="flex flex-col">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const href = alternatePath(pathname, lang)
            const active = lang === language
            return (
              <Link
                key={lang}
                href={href}
                hrefLang={lang}
                role="menuitem"
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  if (!active) setLanguage(lang)
                  setOpen(false)
                }}
                className={cn(
                  "flex h-9 items-center rounded-sm px-3 text-xs font-semibold tracking-wide transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {LABELS[lang]}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
