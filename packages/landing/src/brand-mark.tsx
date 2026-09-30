import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@kompass/ui/lib/utils"

export type BrandMarkProps = {
  icon: LucideIcon
  children: ReactNode
  className?: string
  iconClassName?: string
}

/** Wordmark + minimal Lucide mark; color via `text-primary` / theme tokens. */
export function BrandMark({
  icon: Icon,
  children,
  className,
  iconClassName,
}: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Icon
        className={cn("h-5 w-5 shrink-0 text-primary", iconClassName)}
        strokeWidth={1.75}
        aria-hidden
      />
      {children}
    </span>
  )
}
