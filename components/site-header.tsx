"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const homePath = `/${language}`
  const onHome = pathname === homePath || pathname === `${homePath}/`

  const sectionLinks = [
    { id: "comparison", label: t.navigation.comparison },
    { id: "motivation", label: t.navigation.motivation },
  ]

  function closeMenu() {
    setOpen(false)
  }

  useEffect(() => {
    if (!onHome) return
    const hash = window.location.hash.replace(/^#/, "")
    if (!hash) return
    const timer = window.setTimeout(() => scrollToSection(hash), 80)
    return () => window.clearTimeout(timer)
  }, [onHome])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={homePath}
          className="flex h-9 shrink-0 items-center font-display text-base font-semibold tracking-[-0.01em] text-foreground"
          onClick={closeMenu}
        >
          <span className="text-accent">Berlin</span>
          <span className="mx-1 text-border">·</span>
          <span className="text-foreground">2026</span>
        </Link>

        <div className="flex h-9 items-center gap-1 sm:gap-2">
          <nav className="mr-3 hidden h-9 items-center md:mr-5 md:flex" aria-label="Primary">
            {sectionLinks.map((link) =>
              onHome ? (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className="inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={(event) => handleSectionLinkClick(event, link.id)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.id}
                  href={`${homePath}#${link.id}`}
                  className="inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              )
            )}
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
          {sectionLinks.map((link) =>
            onHome ? (
              <a
                key={link.id}
                href={`#${link.id}`}
                className="flex h-11 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                onClick={(event) =>
                  handleSectionLinkClick(event, link.id, closeMenu)
                }
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.id}
                href={`${homePath}#${link.id}`}
                className="flex h-11 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                onClick={closeMenu}
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  )
}
