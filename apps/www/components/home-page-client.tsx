"use client"

import { Building2, Compass, Droplet, Mail, Vote } from "lucide-react"
import {
  BrandMark,
  LandingShell,
  SiteFooter,
  SiteHeader,
} from "@kompass/landing"
import { Button } from "@kompass/ui/button"
import { metaTagClassName } from "@kompass/ui/lib/chip-styles"
import { HeroCompass } from "@/components/hero-compass"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { COLLECTIVE_EMAIL, PEOPLE } from "@/lib/contacts"
import { programHref, projectHref, type ProjectId } from "@/lib/projects"

const PROJECT_ICONS = {
  water4all: { Icon: Droplet, className: "text-[#0B8FBF]" },
  "berlin-2026": { Icon: Vote, className: "text-[#F55A1F]" },
  polit: { Icon: Building2, className: "text-[#129176]" },
} as const

type IconProps = { className?: string }

function SubstackIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
    </svg>
  )
}

function LinkedInIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

/** Full viewport below sticky header; content can grow past one screen. */
const sectionShell =
  "flex min-h-[calc(100svh-var(--header-offset))] scroll-mt-[var(--header-offset)] flex-col justify-center px-4 py-14 sm:px-6 sm:py-20"
const contentWide = "mx-auto w-full max-w-6xl xl:max-w-7xl"

export function HomePageClient() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`
  const brand = (
    <BrandMark icon={Compass}>
      <span className="text-foreground">{t.brand}</span>
    </BrandMark>
  )

  const projectNames = Object.fromEntries(
    t.projects.items.map((item) => [item.id, item.name])
  ) as Record<ProjectId, string>

  return (
    <LandingShell
      enableScrollSnap
      header={
        <SiteHeader
          brand={brand}
          homeHref={homeHref}
          links={[
            { type: "section", id: "projects", label: t.navigation.projects },
            { type: "section", id: "about", label: t.navigation.about },
            {
              type: "section",
              id: "supporters",
              label: t.navigation.supporters,
            },
            { type: "section", id: "contact", label: t.navigation.contact },
          ]}
          trailing={<LanguageSwitcher />}
        />
      }
      footer={<SiteFooter brand={brand} notice={t.footer.notice} />}
    >
      {/* Hero */}
      <section
        id="hero"
        className={`${sectionShell} animate-[rise_0.55s_ease-out_both]`}
      >
        <div
          className={`${contentWide} grid items-center gap-10 lg:grid-cols-2 lg:gap-14`}
        >
          <div className="max-w-xl">
            <h1 className="font-display text-4xl font-semibold tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[3.25rem]">
              {t.brand}
            </h1>
            <p className="mt-4 text-lg font-medium text-foreground sm:text-xl">
              {t.hero.tagline}
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t.hero.blurb}
            </p>
          </div>

          <div className="mx-auto w-full max-w-md justify-self-center lg:justify-self-end">
            <HeroCompass
              language={language}
              label={t.hero.diagramLabel}
              projectNames={projectNames}
            />
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className={`${sectionShell} bg-section-muted`}>
        <div className={`${contentWide} animate-[rise_0.55s_ease-out_both]`}>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {t.projects.title}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.projects.items.map((project) => {
              const id = project.id as ProjectId
              const href = projectHref(id, language)
              const supportHref = programHref(id)
              const { Icon, className: iconClass } = PROJECT_ICONS[id]
              return (
                <li
                  key={project.id}
                  className="flex min-w-0 flex-col border border-border bg-background p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Icon
                        className={`mt-0.5 h-7 w-7 shrink-0 ${iconClass}`}
                        aria-hidden
                        strokeWidth={1.5}
                      />
                      <h3 className="font-display text-xl font-semibold tracking-[-0.01em]">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {project.name}
                        </a>
                      </h3>
                    </div>
                    <span className={`shrink-0 ${metaTagClassName()}`}>
                      {
                        t.projects.status[
                          project.status as keyof typeof t.projects.status
                        ]
                      }
                    </span>
                  </div>
                  {project.results.length > 0 ? (
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {project.results.map((result) => (
                        <li key={result.label}>
                          <p className="font-display text-2xl font-semibold tabular-nums tracking-[-0.02em] text-foreground">
                            <span className="sr-only">{result.label}: </span>
                            {result.value}
                          </p>
                          <p
                            className="mt-1 text-sm text-muted-foreground"
                            aria-hidden
                          >
                            {result.label}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-4 flex-1 text-base leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  {project.program ? (
                    <p className="mt-5 text-sm">
                      {supportHref ? (
                        <a
                          href={supportHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {project.program}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">
                          {project.program}
                        </span>
                      )}
                    </p>
                  ) : null}
                  <p className="mt-4 text-right text-xs text-muted-foreground">
                    {t.projects.resultsAsOf}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* About / team */}
      <section id="about" className={sectionShell}>
        <div className={`${contentWide} animate-[rise_0.55s_ease-out_both]`}>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {t.about.title}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.about.intro}
          </p>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {PEOPLE.map((person) => {
              const copy = t.team.people[person.id]
              const links = [
                person.linkedin
                  ? {
                      href: person.linkedin,
                      label: t.team.labels.linkedin,
                      icon: LinkedInIcon,
                      external: true,
                    }
                  : null,
                person.email
                  ? {
                      href: `mailto:${person.email}`,
                      label: t.team.labels.email,
                      icon: Mail,
                      external: false,
                    }
                  : null,
                person.substack
                  ? {
                      href: person.substack,
                      label: t.team.labels.substack,
                      icon: SubstackIcon,
                      external: true,
                    }
                  : null,
              ].filter(Boolean) as Array<{
                href: string
                label: string
                icon: typeof LinkedInIcon | typeof Mail | typeof SubstackIcon
                external: boolean
              }>

              return (
                <li
                  key={person.id}
                  className="border border-border bg-background p-6 sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    {person.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element -- static team photo from /public
                      <img
                        src={person.photo}
                        alt={copy.name}
                        width={80}
                        height={80}
                        className="size-16 shrink-0 object-cover sm:size-20"
                      />
                    ) : (
                      <div
                        className="flex size-16 shrink-0 items-center justify-center bg-section-muted font-display text-xl font-semibold text-primary sm:size-20 sm:text-2xl"
                        aria-hidden
                      >
                        {copy.initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-foreground">
                        {copy.name}
                      </h3>
                      <span className={`mt-2 ${metaTagClassName()}`}>
                        {copy.role}
                      </span>
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    {copy.bio}
                  </p>
                  {links.length > 0 ? (
                    <div className="mt-6 flex flex-wrap gap-3">
                      {links.map((link) => {
                        const LinkIcon = link.icon
                        return (
                          <a
                            key={link.label}
                            href={link.href}
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            {...(link.external
                              ? {
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                }
                              : {})}
                          >
                            <LinkIcon className="size-4" aria-hidden />
                            {link.label}
                          </a>
                        )
                      })}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Supporters */}
      <section id="supporters" className={sectionShell}>
        <div className={`${contentWide} animate-[rise_0.55s_ease-out_both]`}>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {t.supporters.title}
          </h2>
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {t.supporters.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-4 border border-border bg-background p-5 sm:gap-5 sm:p-6"
              >
                <div
                  className="flex size-14 shrink-0 items-center justify-center bg-section-muted font-display text-lg font-semibold text-primary"
                  aria-hidden
                >
                  {item.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold tracking-[-0.01em]">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {item.name}
                    </a>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className={sectionShell}>
        <div
          className={`${contentWide} animate-[rise_0.55s_ease-out_both] border border-border bg-background p-6 sm:p-8 lg:p-10`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">
                {t.contact.title}
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                {t.contact.blurb}
              </p>
            </div>
            <Button asChild size="lg" className="w-full shrink-0 lg:w-auto">
              <a href={`mailto:${COLLECTIVE_EMAIL}`}>
                <Mail className="size-4" aria-hidden />
                {t.contact.emailLabel}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </LandingShell>
  )
}
