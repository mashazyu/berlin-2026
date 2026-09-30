"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { handleSectionLinkClick } from "@/lib/scroll-to-section"

export function HeroCta() {
  const { translations: t } = useLanguage()

  return (
    <div className="mt-8 flex justify-center">
      <Button asChild size="lg">
        <a
          href="#comparison"
          onClick={(event) => handleSectionLinkClick(event, "comparison")}
        >
          {t.hero.cta}
        </a>
      </Button>
    </div>
  )
}

export function HeroScrollHint() {
  const { translations: t } = useLanguage()

  return (
    <a
      href="#comparison"
      className="inline-flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-accent"
      aria-label={t.hero.scrollHint}
      onClick={(event) => handleSectionLinkClick(event, "comparison")}
    >
      <ChevronDown className="h-6 w-6 motion-safe:animate-bounce" aria-hidden />
    </a>
  )
}
