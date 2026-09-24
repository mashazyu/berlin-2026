import { ImageResponse } from "next/og"
import { getTranslations, type Language } from "@/lib/i18n/get-translations"
import { toSafeLanguage } from "@/lib/seo/constants"
import { getOgFonts } from "@/lib/seo/og-fonts"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
/** Build-time static OG per locale — CDN-cached (no per-request FOT). */
export const dynamic = "force-static"
export const alt = "Berlin 2026"

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const language = toSafeLanguage(lang) as Language
  const t = getTranslations(language)
  const copy = `${t.metadata.homeTitle} ${t.hero.headline} ${t.hero.support}`
  const fonts = await getOgFonts(copy)
  const fontFamily = fonts[0]?.name ?? "Noto Sans"
  const isRtl = language === "ar"

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
          fontFamily: `"${fontFamily}"`,
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#F55A1F",
              fontFamily: `"${fontFamily}"`,
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
              fontFamily: `"${fontFamily}"`,
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
              fontFamily: `"${fontFamily}"`,
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
              fontFamily: `"${fontFamily}"`,
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
