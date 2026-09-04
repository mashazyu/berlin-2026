import { NextRequest, NextResponse } from "next/server"
import {
  CONTENT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  toSafeLanguage,
} from "@/lib/seo/constants"
import {
  LANGUAGE_COOKIE,
  resolveRequestLanguage,
} from "@/lib/seo/negotiate-language"
import { PAGES } from "@/lib/seo/pages"

const KNOWN_PAGE_PATHS = new Set(
  Object.values(PAGES)
    .map((p) => (p.path.startsWith("/") ? p.path : p.path ? `/${p.path}` : ""))
    .filter(Boolean)
)

function temporaryRedirect(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url, 307)
}

function withContentLanguage(request: NextRequest, response: NextResponse) {
  const segment = request.nextUrl.pathname.split("/")[1]
  if ((SUPPORTED_LANGUAGES as readonly string[]).includes(segment)) {
    response.headers.set(
      "Content-Language",
      CONTENT_LANGUAGE[toSafeLanguage(segment)]
    )
  }
  return response
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const preferredLanguage = resolveRequestLanguage({
    cookieValue: request.cookies.get(LANGUAGE_COOKIE)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  })

  const hasLocale = SUPPORTED_LANGUAGES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )
  if (hasLocale) {
    return withContentLanguage(request, NextResponse.next())
  }

  if (pathname === "/") {
    // 307 (not 308): do not permanently cache negotiated language in the browser
    const response = temporaryRedirect(request, `/${preferredLanguage}`)
    response.headers.set("Vary", "Accept-Language, Cookie")
    return response
  }

  if (KNOWN_PAGE_PATHS.has(pathname)) {
    return temporaryRedirect(request, `/${preferredLanguage}${pathname}`)
  }

  return new NextResponse("Not Found", { status: 404 })
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
}
