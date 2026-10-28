"use client"

import Link from "next/link"
import { SiteChrome } from "@/components/site-chrome"
import { useLanguage } from "@/components/language-provider"

export function AboutPageClient() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`

  return (
    <SiteChrome>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-[-0.01em]">
          {t.about.pageTitle}
        </h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          {t.about.body}
        </p>
        <p className="mt-8">
          <Link
            href={homeHref}
            className="text-primary underline-offset-4 hover:underline"
          >
            ← {t.brand}
          </Link>
        </p>
      </section>
    </SiteChrome>
  )
}
