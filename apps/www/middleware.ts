import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { isLanguage } from "@/lib/i18n"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split("/")
  const segment = segments[1]
  const restPath = `/${segments.slice(2).join("/")}`.replace(/\/$/, "") || ""
  const isLegalPage = restPath === "/privacy" || restPath === "/impressum"

  // Privacy + Impressum exist only in EN/DE; other locales fall back to German.
  if (isLegalPage && isLanguage(segment) && segment !== "en" && segment !== "de") {
    const url = request.nextUrl.clone()
    url.pathname = `/de${restPath}`
    return NextResponse.redirect(url)
  }

  if (!segment || !isLanguage(segment)) {
    const url = request.nextUrl.clone()
    url.pathname = `/de${pathname === "/" ? "" : pathname}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
