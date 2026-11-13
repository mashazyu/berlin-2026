import { MediaPageClient } from "@/components/media-page-client"
import { fetchMediaCoverage } from "@/lib/media/fetch-feeds"
import { pageMetadata } from "@/lib/seo/metadata"

export const revalidate = 1800

export const generateMetadata = pageMetadata("medien")

export default async function MedienPage() {
  const data = await fetchMediaCoverage()
  return <MediaPageClient data={data} />
}
