import { HeroCta, HeroScrollHint } from "@/components/hero-actions"
import { getTranslations, type Language } from "@/lib/i18n/get-translations"

export function Hero({ language }: { language: Language }) {
  const t = getTranslations(language)

  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col bg-section-muted px-4 py-16 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-display text-4xl font-semibold leading-[1.15] tracking-[-0.01em] text-foreground sm:text-5xl md:text-[3.25rem]">
          {t.hero.headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t.hero.support}
        </p>
        <HeroCta />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 sm:gap-8">
        <p className="w-full border-l-4 border-accent pl-4 text-left text-sm font-medium text-foreground/80">
          {t.hero.disclaimer}
        </p>
        <HeroScrollHint />
      </div>
    </section>
  )
}
