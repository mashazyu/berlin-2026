import posthog from "posthog-js"

/** Prefer KEY; also accept PROJECT_TOKEN (PostHog wizard / newer docs). */
export const POSTHOG_KEY =
  process.env.NEXT_PUBLIC_POSTHOG_KEY ||
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  ""

export function isPostHogConfigured(): boolean {
  return Boolean(POSTHOG_KEY)
}

export function capture(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (!POSTHOG_KEY || typeof window === "undefined") return
  if (!posthog.__loaded) return
  posthog.capture(event, properties)
}
