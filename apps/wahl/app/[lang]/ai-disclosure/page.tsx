import { AiDisclosurePageClient } from "@/components/ai-disclosure-page-client"
import { pageMetadata } from "@/lib/seo/metadata"

export const generateMetadata = pageMetadata("aiDisclosure")

export default function AiDisclosurePage() {
  return <AiDisclosurePageClient />
}
