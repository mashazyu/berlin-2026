"use client"

import { Footer } from "@kompass/landing"
import { useLanguage } from "@/components/language-provider"

export function SiteFooter() {
  const { language } = useLanguage()
  return <Footer language={language} />
}
