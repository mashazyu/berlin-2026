import { ImageResponse } from "next/og"
import { getTranslations, type Language } from "@/lib/i18n/get-translations"
import { SUPPORTED_LANGUAGES, toSafeLanguage } from "@/lib/seo/constants"
import { getOgFonts } from "@/lib/seo/og-fonts"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }))
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = toSafeLanguage(lang) as Language
  const t = getTranslations(language)
  const fonts = await getOgFonts(`${t.hero.headline} ${t.hero.support}`)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#ffffff",
          color: "#171E25",
          fontFamily: '"Noto Sans"',
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#F55A1F",
              fontFamily: '"Noto Sans"',
            }}
          >
            Berlin
          </span>
          <span style={{ fontSize: 40, color: "#C5CCD3" }}>·</span>
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#171E25",
              fontFamily: '"Noto Sans"',
            }}
          >
            2026
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1.2,
              maxWidth: 980,
              fontFamily: '"Noto Sans"',
            }}
          >
            {t.hero.headline}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#5A6570",
              maxWidth: 900,
              fontWeight: 400,
              fontFamily: '"Noto Sans"',
            }}
          >
            {t.hero.support}
          </div>
        </div>
        <div
          style={{
            width: 64,
            height: 6,
            borderRadius: 999,
            background: "#F55A1F",
          }}
        />
      </div>
    ),
    { ...size, fonts }
  )
}
