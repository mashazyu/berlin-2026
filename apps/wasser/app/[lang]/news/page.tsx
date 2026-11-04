import { NewsPageClient } from "@/components/news-page-client"
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
    title: `${t.newsPage.title} — ${t.brand}`,
    description: t.newsPage.intro || t.hero.support,
  }
}

export default function NewsPage() {
  return <NewsPageClient />
}
