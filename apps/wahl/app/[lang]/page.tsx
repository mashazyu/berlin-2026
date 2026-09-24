import { Hero } from "@/components/hero"
import { HomePageClient } from "@/components/home-page-client"
import { ComparisonTableSeo } from "@/components/comparison-table-seo"
import { getComparison } from "@/lib/comparison/get-comparison"
import { type Language } from "@/lib/i18n/get-translations"
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
  const comparison = getComparison(language)

  return (
    <>
      <JsonLd language={language} />
      <HomePageClient
        lang={language}
        hero={<Hero language={language} />}
        comparisonSeo={
          <ComparisonTableSeo comparison={comparison} language={language} />
        }
      />
    </>
  )
}
