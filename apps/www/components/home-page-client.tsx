"use client"

import { Droplets, Landmark, Mail, Vote } from "lucide-react"
import {
  LandingShell,
  SiteFooter,
  SiteHeader,
} from "@kompass/landing"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/components/language-provider"
import { PEOPLE } from "@/lib/contacts"
import { projectHref, type ProjectId } from "@/lib/projects"

const PROJECT_ICONS = {
  water4all: Droplets,
  "berlin-2026": Vote,
  polit: Landmark,
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

export function HomePageClient() {
  const { language, translations: t } = useLanguage()
  const homeHref = `/${language}`

  return (
    <LandingShell
      enableScrollSnap={false}
      header={
        <SiteHeader
          brand={<span className="text-foreground">{t.brand}</span>}
          homeHref={homeHref}
          links={[
            { type: "section", id: "projects", label: t.navigation.projects },
            { type: "section", id: "contacts", label: t.navigation.contacts },
          ]}
          trailing={<LanguageSwitcher />}
        />
      }
      footer={
        <SiteFooter
          brand={<span className="text-foreground">{t.brand}</span>}
          notice={t.footer.notice}
        />
      }
    >
      <section
        id="about"
        className="scroll-mt-[4.25rem] px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl animate-[rise_0.55s_ease-out_both]">
          <h1 className="sr-only">{t.brand}</h1>
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.intro.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section
        id="projects"
        className="scroll-mt-[4.25rem] bg-[hsl(var(--section-muted))] px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-6xl animate-[rise_0.55s_ease-out_both]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {t.projects.title}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.projects.items.map((project) => {
              const href = projectHref(project.id as ProjectId, language)
              const Icon = PROJECT_ICONS[project.id as ProjectId]
              return (
                <li key={project.id}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full flex-col border border-border bg-background p-6 transition-colors hover:border-primary hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon
                      className="h-8 w-8 text-primary"
                      aria-hidden
                      strokeWidth={1.5}
                    />
                    <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
                      {project.name}
                    </h3>
                    <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section
        id="contacts"
        className="scroll-mt-[4.25rem] px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-6xl animate-[rise_0.55s_ease-out_both]">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {t.contacts.title}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {PEOPLE.map((person) => {
              const copy = t.contacts.people[person.id]
              const links = [
                person.linkedin
                  ? {
                      href: person.linkedin,
                      label: t.contacts.labels.linkedin,
                      icon: LinkedInIcon,
                      external: true,
                    }
                  : null,
                person.email
                  ? {
                      href: `mailto:${person.email}`,
                      label: t.contacts.labels.email,
                      icon: Mail,
                      external: false,
                    }
                  : null,
                person.substack
                  ? {
                      href: person.substack,
                      label: t.contacts.labels.substack,
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
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.01em] text-foreground">
                    {copy.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {copy.role}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {links.map((link) => {
                      const Icon = link.icon
                      return (
                        <a
                          key={link.label}
                          href={link.href}
                          className="inline-flex h-11 w-11 items-center justify-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={`${copy.name} — ${link.label}`}
                          {...(link.external
                            ? {
                                target: "_blank",
                                rel: "noopener noreferrer",
                              }
                            : {})}
                        >
                          <Icon className="h-5 w-5" aria-hidden />
                        </a>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </section>
    </LandingShell>
  )
}
