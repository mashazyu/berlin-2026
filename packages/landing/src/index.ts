export { LandingShell } from "./landing-shell"
export type { LandingShellProps } from "./landing-shell"

export { Hero } from "./hero"
export type { HeroProps } from "./hero"

export { HeroCta, HeroScrollHint } from "./hero-actions"
export type { HeroCtaProps, HeroScrollHintProps } from "./hero-actions"

export { ContentSection } from "./content-section"
export type { ContentSectionProps, ContentBlock } from "./content-section"

export { MentionsSection } from "./mentions-section"
export type {
  MentionsSectionProps,
  MentionItem,
  MentionKind,
} from "./mentions-section"

export { SiteHeader } from "./site-header"
export type { SiteHeaderProps, NavLink } from "./site-header"

export { SiteFooter } from "./site-footer"
export type { SiteFooterProps, FooterLink } from "./site-footer"

export { SectionScrollSnap } from "./section-scroll-snap"

export {
  scrollToSection,
  handleSectionLinkClick,
  snapNearestSectionIfNeeded,
  headerHeight,
  getSectionSnapTarget,
} from "./scroll-to-section"
