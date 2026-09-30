import type { ReactNode } from "react"

export type HeroProps = {
  headline: string
  support: string
  blurb?: string
  disclaimer?: string
  cta?: ReactNode
  scrollHint?: ReactNode
  id?: string
}

export function Hero({
  headline,
  support,
  blurb,
  disclaimer,
  cta,
  scrollHint,
  id = "hero",
}: HeroProps) {
  return (
    <section
      id={id}
      className="relative flex min-h-[calc(100svh-3.5rem)] flex-col bg-section-muted px-4 py-16 sm:px-6"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
        <h1 className="font-display text-4xl font-semibold leading-[1.15] tracking-[-0.01em] text-foreground sm:text-5xl md:text-[3.25rem]">
          {headline}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {support}
        </p>
        {blurb ? (
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            {blurb}
          </p>
        ) : null}
        {cta}
      </div>

      {(disclaimer || scrollHint) && (
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 sm:gap-8">
          {disclaimer ? (
            <p className="w-full border-s-4 border-accent ps-4 text-start text-sm font-medium text-foreground/80">
              {disclaimer}
            </p>
          ) : null}
          {scrollHint}
        </div>
      )}
    </section>
  )
}
