"use client"

import { Building2, Compass, Droplet, Vote } from "lucide-react"
import { cn } from "@kompass/ui/lib/utils"
import { projectHref, type ProjectId } from "@/lib/projects"
import type { Language } from "@/lib/i18n"

const NODES: Array<{
  id: ProjectId
  Icon: typeof Droplet
  color: string
  /** percent positions inside the diagram */
  x: number
  y: number
}> = [
  { id: "water4all", Icon: Droplet, color: "#0B8FBF", x: 18, y: 22 },
  { id: "berlin-2026", Icon: Vote, color: "#F55A1F", x: 82, y: 28 },
  { id: "polit", Icon: Building2, color: "#129176", x: 50, y: 82 },
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
      className="relative aspect-square w-full max-w-md border border-border bg-section-muted p-4 sm:p-6"
      role="img"
      aria-label={label}
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
            stroke="hsl(var(--border))"
            strokeWidth="0.6"
            strokeDasharray="2 2"
          />
        ))}
      </svg>

      <div
        className="absolute flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-border bg-primary text-primary-foreground sm:size-[4.5rem]"
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
            className={cn(
              "absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-border bg-background transition-colors",
              "hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-14"
            )}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            aria-label={projectNames[node.id]}
          >
            <Icon
              className="size-5 sm:size-6"
              style={{ color: node.color }}
              strokeWidth={1.5}
              aria-hidden
            />
          </a>
        )
      })}
    </div>
  )
}
