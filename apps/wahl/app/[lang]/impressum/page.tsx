import { ImpressumPageClient } from "@/components/impressum-page-client"
import { pageMetadata } from "@/lib/seo/metadata"

export const generateMetadata = pageMetadata("impressum")

export default function ImpressumPage() {
  return <ImpressumPageClient />
}
