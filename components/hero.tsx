"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function Hero() {
  const { translations: t } = useLanguage()

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />

      <div className="relative mx-auto max-w-4xl animate-[rise_0.55s_ease-out_both] text-center">
        <p className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.2em] text-primary sm:text-base">
          {t.brand.name}
        </p>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl">
          {t.hero.headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t.hero.support}
        </p>
        <p className="mt-3 text-sm font-medium text-foreground/70">
          {t.hero.electionDate}
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <a href="#table">{t.hero.cta}</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
