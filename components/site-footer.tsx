"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

export function SiteFooter() {
  const { language, translations: t } = useLanguage()

  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t.footer.aiNotice}
        </p>

        <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-sm font-semibold tracking-[-0.01em]">
            <span className="text-accent">Berlin</span>
            <span className="mx-1 text-border">·</span>
            <span className="text-foreground">2026</span>
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Link
              href={`/${language}/about`}
              className="transition-colors hover:text-foreground"
            >
              {t.footer.about}
            </Link>
            <Link
              href={`/${language}/ai-disclosure`}
              className="transition-colors hover:text-foreground"
            >
              {t.footer.aiDisclosure}
            </Link>
            <Link
              href={`/${language}/privacy`}
              className="transition-colors hover:text-foreground"
            >
              {t.footer.privacy}
            </Link>
            <a
              href="mailto:nina.harz@pm.me"
              className="transition-colors hover:text-foreground"
            >
              {t.footer.contact}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
