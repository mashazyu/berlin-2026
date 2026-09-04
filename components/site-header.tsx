"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import {
  handleSectionLinkClick,
  scrollToSection,
} from "@/lib/scroll-to-section"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const { language, translations: t } = useLanguage()
  const [open, setOpen] = useState(false)

  const links = [
    { href: "about", label: t.navigation.about },
    { href: "table", label: t.navigation.table },
  ]

  function closeMenu() {
    setOpen(false)
  }

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) return
    // Wait for layout after language / content paint
    const timer = window.setTimeout(() => scrollToSection(hash), 80)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={`/${language}`}
          className="flex h-9 shrink-0 items-center font-display text-base font-bold tracking-tight text-foreground"
          onClick={closeMenu}
        >
          <span className="text-accent">Berlin</span>
          <span className="mx-1 text-border">·</span>
          <span className="text-foreground">2026</span>
        </Link>

        <div className="flex h-9 items-center gap-1 sm:gap-2">
          <nav className="hidden h-9 items-center md:flex" aria-label="Primary">
            {links.map((link) => (
              <a
                key={link.href}
                href={`#${link.href}`}
                className="inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={(event) => handleSectionLinkClick(event, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <LanguageSwitcher />

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-nav"
        className={cn(
          "border-t border-border bg-white md:hidden",
          open ? "block" : "hidden"
        )}
        aria-label="Mobile"
      >
        <div className="mx-auto flex max-w-7xl flex-col px-2 py-2 sm:px-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={`#${link.href}`}
              className="flex h-11 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              onClick={(event) =>
                handleSectionLinkClick(event, link.href, closeMenu)
              }
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  )
}
