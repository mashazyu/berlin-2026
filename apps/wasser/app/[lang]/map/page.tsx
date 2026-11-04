import { MapPageClient } from "@/components/map-page-client"
import { getTranslations, toSafeLanguage } from "@/lib/i18n"
import type { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const t = getTranslations(toSafeLanguage(lang))
  return {
    title: `${t.map.heroTitle} — ${t.brand}`,
    description: t.hero.support,
  }
}

export default function MapPage() {
  return <MapPageClient />
}
