"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

export function SiteFooter() {
  const { language, translations: t } = useLanguage()

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm font-bold tracking-tight">
            <span className="text-primary">Berlin</span>
            <span className="mx-1 text-border">·</span>
            <span className="text-accent">2026</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <a
              href="https://www.berlinvote.help/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              BerlinVote.Help
            </a>
            <a
              href="mailto:nina.harz@pm.me"
              className="transition-colors hover:text-foreground"
            >
              {t.footer.contact}
            </a>
            <Link
              href={`/${language}/privacy`}
              className="transition-colors hover:text-foreground"
            >
              {t.footer.privacy}
            </Link>
          </div>
        </div>

        <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm leading-relaxed text-muted-foreground">
          <p>{t.footer.aiNote}</p>
          <p>{t.footer.unaffiliated}</p>
        </div>
      </div>
    </footer>
  )
}
