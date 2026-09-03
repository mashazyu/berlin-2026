"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"

export function SiteHeader() {
  const { language, translations: t } = useLanguage()

  const links = [
    { href: `#about`, label: t.navigation.about },
    { href: `#table`, label: t.navigation.table },
    { href: `#analysis`, label: t.navigation.analysis },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href={`/${language}`}
          className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl"
        >
          <span className="text-primary">Berlin</span>{" "}
          <span className="text-accent">2026</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <LanguageSwitcher />
      </div>
    </header>
  )
}
