import { getTranslations, type Language } from "@/lib/i18n/get-translations"
import { BASE_URL, buildAbsoluteUrl } from "@/lib/seo/constants"
import { homeSharingMeta } from "@/lib/seo/pages"

export function JsonLd({ language }: { language: Language }) {
  const t = getTranslations(language)
  const url = buildAbsoluteUrl(language, "")
  const sharing = homeSharingMeta(t)

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Berlin 2026",
        inLanguage: ["en", "de", "ru"],
        publisher: {
          "@type": "Organization",
          name: "Berlin 2026",
          url: BASE_URL,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: sharing.title,
        description: sharing.description,
        isPartOf: { "@id": `${BASE_URL}/#website` },
        inLanguage: language,
        about: {
          "@type": "Event",
          name:
            language === "de"
              ? "Wahl zum Abgeordnetenhaus von Berlin 2026"
              : language === "ru"
                ? "Земельные выборы в Берлине 2026"
                : "2026 Berlin state election",
          startDate: "2026-09-20",
          location: {
            "@type": "Place",
            name: "Berlin",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Berlin",
              addressCountry: "DE",
            },
          },
        },
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
