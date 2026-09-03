import { HomePageClient } from "@/components/home-page-client"
import { getComparison } from "@/lib/comparison/get-comparison"
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/get-translations"
import { pageMetadata } from "@/lib/seo/metadata"

export const generateMetadata = pageMetadata("home")

export default function HomePage() {
  const comparisonByLang = Object.fromEntries(
    SUPPORTED_LANGUAGES.map((lang) => [lang, getComparison(lang)])
  )

  return <HomePageClient comparisonByLang={comparisonByLang} />
}
