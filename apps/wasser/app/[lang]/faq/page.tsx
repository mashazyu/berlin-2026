import { FaqPageClient } from "@/components/faq-page-client"
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
    title: `${t.faq.title} — ${t.brand}`,
    description: t.faq.description || t.hero.support,
  }
}

export default function FaqPage() {
  return <FaqPageClient />
}
