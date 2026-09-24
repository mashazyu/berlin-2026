import type { ReactNode } from "react"
import Link from "next/link"

export type FooterLink = {
  href: string
  label: string
  external?: boolean
}

export type SiteFooterProps = {
  brand: ReactNode
  notice?: string
  links: FooterLink[]
}

export function SiteFooter({ brand, notice, links }: SiteFooterProps) {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {notice ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {notice}
          </p>
        ) : null}

        <div
          className={
            notice
              ? "mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"
              : "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          }
        >
          <p className="font-display text-sm font-semibold tracking-[-0.01em]">
            {brand}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {links.map((link) =>
              link.external || link.href.startsWith("mailto:") ? (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
