import { Hero } from "@/components/hero"
import { HomePageClient } from "@/components/home-page-client"
import { getComparison } from "@/lib/comparison/get-comparison"
import {
  SUPPORTED_LANGUAGES,
  type Language,
} from "@/lib/i18n/get-translations"
import { toSafeLanguage } from "@/lib/seo/constants"
import { pageMetadata } from "@/lib/seo/metadata"
import { JsonLd } from "@/components/json-ld"

export const generateMetadata = pageMetadata("home")

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = toSafeLanguage(lang) as Language
  const comparisonByLang = Object.fromEntries(
    SUPPORTED_LANGUAGES.map((code) => [code, getComparison(code)])
  )

  return (
    <>
      <JsonLd language={language} />
      <HomePageClient
        comparisonByLang={comparisonByLang}
        hero={<Hero language={language} />}
      />
    </>
  )
}
