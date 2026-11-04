import { redirect } from "next/navigation"
import { toSafeLanguage } from "@/lib/i18n"

/** Former map URL — map is now the home page. */
export default async function MapPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  redirect(`/${toSafeLanguage(lang)}`)
}
