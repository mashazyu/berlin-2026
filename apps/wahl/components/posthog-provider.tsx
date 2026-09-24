"use client"

import { useEffect } from "react"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useLanguage } from "@/components/language-provider"
import { isPostHogConfigured, POSTHOG_KEY } from "@/lib/analytics"

const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com"

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { language } = useLanguage()

  useEffect(() => {
    if (!POSTHOG_KEY || posthog.__loaded) return

    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      ui_host: "https://eu.posthog.com",
      cookieless_mode: "always",
      person_profiles: "never",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: true,
    })
  }, [])

  useEffect(() => {
    if (!POSTHOG_KEY) return

    const applyLanguage = () => {
      if (!posthog.__loaded) return false
      posthog.register({ ui_language: language })
      return true
    }

    if (applyLanguage()) return

    const id = window.setInterval(() => {
      if (applyLanguage()) window.clearInterval(id)
    }, 100)
    return () => window.clearInterval(id)
  }, [language])

  if (!isPostHogConfigured()) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
