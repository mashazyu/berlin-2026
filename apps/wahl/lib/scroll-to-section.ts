import type { MouseEvent } from "react"

export function headerHeight() {
  const header = document.querySelector("header")
  return header ? Math.round(header.getBoundingClientRect().height) : 56
}

export function getSectionSnapTarget(section: HTMLElement): HTMLElement {
  return section.querySelector<HTMLElement>("h1, h2") ?? section
}

export function scrollToSection(sectionId: string) {
  const id = sectionId.replace(/^#/, "")
  const section = document.getElementById(id)
  if (!section) return

  const target = getSectionSnapTarget(section)
  const top =
    window.scrollY + target.getBoundingClientRect().top - headerHeight() - 8

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
  history.replaceState(null, "", `#${id}`)
}

export function handleSectionLinkClick(
  event: MouseEvent<HTMLAnchorElement>,
  sectionId: string,
  afterClick?: () => void
) {
  event.preventDefault()
  afterClick?.()
  window.dispatchEvent(new CustomEvent("section-nav-start"))
  window.requestAnimationFrame(() => {
    window.setTimeout(() => scrollToSection(sectionId), 80)
  })
}

/** After free-scroll settles, snap if a section heading is near the header line. */
export function snapNearestSectionIfNeeded() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const snapLine = headerHeight() + 8
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("main > section")
  )
  if (sections.length === 0) return

  let best: { el: HTMLElement; dist: number } | null = null

  for (const section of sections) {
    // Never snap the hero / first section
    if (section.id === "hero" || !section.id) continue

    const target = getSectionSnapTarget(section)
    const dist = target.getBoundingClientRect().top - snapLine
    // Heading near the top edge (slightly above or below) → snap into place
    if (dist > -100 && dist < 160) {
      if (!best || Math.abs(dist) < Math.abs(best.dist)) {
        best = { el: target, dist }
      }
    }
  }

  if (!best || Math.abs(best.dist) < 6) return

  const top = window.scrollY + best.el.getBoundingClientRect().top - snapLine
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
}
