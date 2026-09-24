import { HomePageClient } from "@/components/home-page-client"
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
    title: t.brand,
    description: t.meta.description,
  }
}

export default function HomePage() {
  return <HomePageClient />
}
