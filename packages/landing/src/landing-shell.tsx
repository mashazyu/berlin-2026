import type { ReactNode } from "react"
import { SectionScrollSnap } from "./section-scroll-snap"

export type LandingShellProps = {
  header: ReactNode
  footer: ReactNode
  children: ReactNode
  fab?: ReactNode
  enableScrollSnap?: boolean
}

export function LandingShell({
  header,
  footer,
  children,
  fab,
  enableScrollSnap = true,
}: LandingShellProps) {
  return (
    <div className="lang-fade min-h-screen bg-background">
      {enableScrollSnap ? <SectionScrollSnap /> : null}
      {header}
      <main>{children}</main>
      {footer}
      {fab}
    </div>
  )
}
