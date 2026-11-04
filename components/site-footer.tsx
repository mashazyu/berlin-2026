"use client"

import { Compass } from "lucide-react"
import { Footer } from "@kompass/landing"
import { useLanguage } from "@/components/language-provider"

export function SiteFooter() {
  const { language, translations: t } = useLanguage()
  return (
    <Footer icon={Compass} name={t.brand.name} language={language} />
  )
}
