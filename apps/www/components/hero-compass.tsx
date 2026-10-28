"use client"

import { Building2, Compass, Droplet, Vote } from "lucide-react"
import { cn } from "@kompass/ui/lib/utils"
import { projectHref, type ProjectId } from "@/lib/projects"
import type { Language } from "@/lib/i18n"

const NODES: Array<{
  id: ProjectId
  Icon: typeof Droplet
  color: string
  /** percent positions inside the diagram (circle centers) */
  x: number
  y: number
}> = [
  { id: "water4all", Icon: Droplet, color: "#0B8FBF", x: 18, y: 22 },
  { id: "berlin-2026", Icon: Vote, color: "#F55A1F", x: 82, y: 22 },
  { id: "polit", Icon: Building2, color: "#8B3A5C", x: 50, y: 80 },
]

type HeroCompassProps = {
  language: Language
  label: string
  projectNames: Record<ProjectId, string>
}

export function HeroCompass({
  language,
  label,
  projectNames,
}: HeroCompassProps) {
  const hub = { x: 50, y: 48 }

  return (
    <div
      className="relative aspect-square w-full max-w-md overflow-visible p-4 sm:p-6"
      role="img"
      aria-label={label}
      style={{
        background:
          "radial-gradient(ellipse 68% 68% at 50% 48%, hsl(162 36% 90% / 0.95) 0%, hsl(162 28% 94% / 0.45) 42%, transparent 72%)",
      }}
    >
      <svg
        className="pointer-events-none absolute inset-4 sm:inset-6"
        viewBox="0 0 100 100"
        aria-hidden
      >
        {NODES.map((node) => (
          <line
            key={node.id}
            x1={hub.x}
            y1={hub.y}
            x2={node.x}
            y2={node.y}
            stroke="hsl(var(--primary) / 0.22)"
            strokeWidth="0.65"
            strokeDasharray="2.2 2.2"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <div
        className="absolute flex size-[4.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 sm:size-[4.75rem]"
        style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
      >
        <Compass className="size-8 sm:size-9" strokeWidth={1.5} aria-hidden />
      </div>

      {NODES.map((node) => {
        const Icon = node.Icon
        return (
          <a
            key={node.id}
            href={projectHref(node.id, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            aria-label={projectNames[node.id]}
          >
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-full border border-border/70 bg-background/95 shadow-sm transition-transform sm:size-14",
                "hover:scale-105 hover:border-primary/40"
              )}
            >
              <Icon
                className="size-5 sm:size-6"
                style={{ color: node.color }}
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
            <span className="absolute left-1/2 top-[calc(100%+0.45rem)] hidden w-[6.75rem] -translate-x-1/2 text-center text-[0.7rem] font-medium leading-snug text-foreground/85 sm:block sm:w-28 sm:text-xs">
              {projectNames[node.id]}
            </span>
          </a>
        )
      })}
    </div>
  )
}
