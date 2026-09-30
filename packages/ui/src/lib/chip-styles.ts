import { cn } from "cn"

/** Shared chip look used by filters and mention topic tags. */
export function selectionChipClassName(active = false) {
  return cn(
    "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors",
    active
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
  )
}

/** Non-interactive tag variant (same inactive chip look, no hover affordance). */
export function metaTagClassName() {
  return "inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-muted-foreground"
}
