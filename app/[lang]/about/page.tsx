import { AboutPageClient } from "@/components/about-page-client"
import { pageMetadata } from "@/lib/seo/metadata"

export const generateMetadata = pageMetadata("about")

export default function AboutPage() {
  return <AboutPageClient />
}
