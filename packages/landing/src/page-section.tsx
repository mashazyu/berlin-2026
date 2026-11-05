import type { ReactNode } from "react"
import { cn } from "@kompass/ui/lib/utils"

export type PageSectionProps = {
  id?: string
  /** Section heading. Omit for custom heading inside children. */
  title?: ReactNode
  titleAs?: "h1" | "h2"
  /** Muted band background (`bg-section-muted`). */
  muted?: boolean
  /** Fill viewport on md+ (home scroll sections). */
  fillViewport?: boolean
  /** Content max width. */
  width?: "narrow" | "wide"
  className?: string
  children: ReactNode
}

const widthClass = {
  narrow: "mx-auto w-full max-w-3xl",
  wide: "mx-auto w-full max-w-6xl xl:max-w-7xl",
} as const

/**
 * Shared page band used across Kompass apps — matches www/polit/wasser section shells.
 */
export function PageSection({
  id,
  title,
  titleAs: TitleTag = "h2",
  muted = false,
  fillViewport = false,
  width = "wide",
  className,
  children,
}: PageSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "flex scroll-mt-[var(--header-offset)] flex-col justify-start px-4 py-14 sm:px-6 sm:py-20",
        fillViewport &&
          "md:min-h-[calc(100svh-var(--header-offset))] md:justify-center",
        muted ? "bg-section-muted" : "bg-background",
        className
      )}
    >
      <div className={cn(widthClass[width], "animate-[rise_0.55s_ease-out_both]")}>
        {title ? (
          <TitleTag className="font-display text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">
            {title}
          </TitleTag>
        ) : null}
        {children}
      </div>
    </section>
  )
}
