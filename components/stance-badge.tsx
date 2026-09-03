"use client"

import type { Stance } from "@/lib/comparison/types"
import { cn } from "@/lib/utils"

const ICONS: Record<Stance, string> = {
  for: "✓",
  against: "✗",
  mixed: "≈",
  none: "—",
}

const STYLES: Record<Stance, string> = {
  for: "bg-stance-for/15 text-stance-for ring-stance-for/25",
  against: "bg-stance-against/15 text-stance-against ring-stance-against/25",
  mixed: "bg-stance-mixed/20 text-amber-800 ring-stance-mixed/30",
  none: "bg-muted text-stance-none ring-border",
}

export function StanceBadge({
  stance,
  label,
  className,
}: {
  stance: Stance
  label?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-xs font-bold ring-1 animate-[chip-in_0.4s_ease-out_both]",
        STYLES[stance],
        className
      )}
      title={label}
      aria-label={label ?? stance}
    >
      {ICONS[stance]}
    </span>
  )
}
