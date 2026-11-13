import { MediaPageClient } from "@/components/media-page-client"
import { fetchMediaCoverage } from "@/lib/media/fetch-feeds"
import { pageMetadata } from "@/lib/seo/metadata"

/** Live RSS — always fetch on request (avoids empty SSG from build-time network). */
export const dynamic = "force-dynamic"

export const generateMetadata = pageMetadata("medien")

export default async function MedienPage() {
  const data = await fetchMediaCoverage()
  return <MediaPageClient data={data} />
}
