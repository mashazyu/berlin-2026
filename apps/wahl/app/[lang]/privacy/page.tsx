import { PrivacyPageClient } from "@/components/privacy-page-client"
import { pageMetadata } from "@/lib/seo/metadata"

export const generateMetadata = pageMetadata("privacy")

export default function PrivacyPage() {
  return <PrivacyPageClient />
}
