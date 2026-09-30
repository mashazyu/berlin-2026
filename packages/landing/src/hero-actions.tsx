"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@kompass/ui/button"
import { handleSectionLinkClick } from "./scroll-to-section"

export type HeroCtaProps = {
  label: string
  href?: string
  sectionId?: string
}

export function HeroCta({
  label,
  href = "#content",
  sectionId = "content",
}: HeroCtaProps) {
  return (
    <div className="mt-8 flex justify-center">
      <Button asChild size="lg">
        <a
          href={href}
          onClick={(event) => handleSectionLinkClick(event, sectionId)}
        >
          {label}
        </a>
      </Button>
    </div>
  )
}

export type HeroScrollHintProps = {
  label: string
  href?: string
  sectionId?: string
}

export function HeroScrollHint({
  label,
  href = "#content",
  sectionId = "content",
}: HeroScrollHintProps) {
  return (
    <a
      href={href}
      className="inline-flex flex-col items-center gap-1 text-muted-foreground transition-colors hover:text-accent"
      aria-label={label}
      onClick={(event) => handleSectionLinkClick(event, sectionId)}
    >
      <ChevronDown className="h-6 w-6 motion-safe:animate-bounce" aria-hidden />
    </a>
  )
}
