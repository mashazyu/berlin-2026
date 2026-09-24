"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { cn } from "@kompass/ui/lib/utils"
import { handleSectionLinkClick, scrollToSection } from "./scroll-to-section"

export type NavLink =
  | { type: "section"; id: string; label: string }
  | { type: "page"; href: string; label: string; matchPath?: string }

export type SiteHeaderProps = {
  brand: ReactNode
  homeHref: string
  links: NavLink[]
  trailing?: ReactNode
  openMenuLabel?: string
  closeMenuLabel?: string
}

export function SiteHeader({
  brand,
  homeHref,
  links,
  trailing,
  openMenuLabel = "Open menu",
  closeMenuLabel = "Close menu",
}: SiteHeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const onHome =
    pathname === homeHref ||
    pathname === `${homeHref}/` ||
    pathname === homeHref.replace(/\/$/, "")

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

  const navLinkClass =
    "inline-flex h-9 items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
  const mobileLinkClass =
    "flex h-11 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"

  function renderLink(link: NavLink, mobile: boolean) {
    const className = mobile ? mobileLinkClass : navLinkClass

    if (link.type === "section") {
      if (onHome) {
        return (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={className}
            onClick={(event) =>
              handleSectionLinkClick(event, link.id, closeMenu)
            }
          >
            {link.label}
          </a>
        )
      }
      return (
        <Link
          key={link.id}
          href={`${homeHref}#${link.id}`}
          className={className}
          onClick={closeMenu}
        >
          {link.label}
        </Link>
      )
    }

    const match = link.matchPath ?? link.href
    const active =
      pathname === match ||
      pathname === `${match}/` ||
      pathname.startsWith(`${match}/`)

    return (
      <Link
        key={link.href}
        href={link.href}
        className={cn(
          className,
          active && (mobile ? "bg-muted" : "text-foreground")
        )}
        aria-current={active ? "page" : undefined}
        onClick={closeMenu}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href={homeHref}
          className="flex h-9 shrink-0 items-center font-display text-base font-semibold tracking-[-0.01em] text-foreground"
          onClick={closeMenu}
        >
          {brand}
        </Link>

        <div className="flex h-9 items-center gap-1 sm:gap-2">
          <nav
            className="me-3 hidden h-9 items-center md:me-5 md:flex"
            aria-label="Primary"
          >
            {links.map((link) => renderLink(link, false))}
          </nav>

          {trailing}

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? closeMenuLabel : openMenuLabel}
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
          {links.map((link) => renderLink(link, true))}
        </div>
      </nav>
    </header>
  )
}
