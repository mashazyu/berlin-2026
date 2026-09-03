import { redirect } from "next/navigation"
import { DEFAULT_LANGUAGE } from "@/lib/seo/constants"

export default function RootPage() {
  redirect(`/${DEFAULT_LANGUAGE}`)
}
