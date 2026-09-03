"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

export function SiteFooter() {
  const { language, translations: t } = useLanguage()

  return (
    <footer className="border-t border-border/70 bg-foreground text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xl space-y-3 text-sm text-white/80">
          <p className="font-display text-lg font-bold text-white">
            <span className="text-secondary">Berlin</span> 2026
          </p>
          <p>{t.footer.aiNote}</p>
          <p>
            <a
              href="https://www.berlinvote.help/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline-offset-2 hover:underline"
            >
              {t.footer.relatedSite}
            </a>
          </p>
          <p>{t.footer.unaffiliated}</p>
        </div>
        <div className="space-y-2 text-sm">
          <a
            href="mailto:nina.harz@pm.me"
            className="block text-white/90 underline-offset-2 hover:underline"
          >
            {t.footer.contact}
          </a>
          <Link
            href={`/${language}/privacy`}
            className="block text-white/90 underline-offset-2 hover:underline"
          >
            {t.footer.privacy}
          </Link>
        </div>
      </div>
    </footer>
  )
}
