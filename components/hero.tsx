"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { handleSectionLinkClick } from "@/lib/scroll-to-section"

export function Hero() {
  const { translations: t } = useLanguage()

  return (
    <section className="flex min-h-[calc(100svh-3.5rem)] flex-col bg-section-muted px-4 py-16 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-[-0.01em] text-foreground sm:text-5xl md:text-6xl">
          {t.hero.headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t.hero.support}
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <a
              href="#table"
              onClick={(event) => handleSectionLinkClick(event, "table")}
            >
              {t.hero.cta}
            </a>
          </Button>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-xl border-l-4 border-accent pl-4 text-left text-sm font-medium text-foreground/80 sm:mt-12">
        {t.hero.disclaimer}
      </p>
    </section>
  )
}
