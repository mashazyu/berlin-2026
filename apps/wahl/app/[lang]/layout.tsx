import type React from "react"
import { Lora, DM_Sans, Noto_Sans_Arabic } from "next/font/google"
import { notFound } from "next/navigation"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/components/language-provider"
import { PostHogProvider } from "@/components/posthog-provider"
import type { Language } from "@/lib/i18n/types"
import { CONTENT_LANGUAGE, SUPPORTED_LANGUAGES } from "@/lib/seo/constants"

const lora = Lora({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-lora",
  display: "swap",
})

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
})

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-sans-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }))
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!(SUPPORTED_LANGUAGES as readonly string[]).includes(lang)) {
    notFound()
  }
  const language = lang as Language
  const isArabic = language === "ar"

  return (
    <html
      lang={CONTENT_LANGUAGE[language]}
      dir={isArabic ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={
          isArabic
            ? `${notoSansArabic.variable} font-arabic antialiased`
            : `${lora.variable} ${dmSans.variable} font-sans antialiased`
        }
      >
        <LanguageProvider initialLanguage={language}>
          <PostHogProvider>{children}</PostHogProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
