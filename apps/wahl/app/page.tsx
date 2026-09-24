import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  LANGUAGE_COOKIE,
  resolveRequestLanguage,
} from "@/lib/seo/negotiate-language"

/** Fallback if middleware does not run; prefers cookie, then Accept-Language, else EN. */
export default async function RootPage() {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const lang = resolveRequestLanguage({
    cookieValue: cookieStore.get(LANGUAGE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  })
  redirect(`/${lang}`)
}
