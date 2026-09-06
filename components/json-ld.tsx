import { getTranslations, type Language } from "@/lib/i18n/get-translations"
import { BASE_URL, buildAbsoluteUrl } from "@/lib/seo/constants"
import { homeSharingMeta } from "@/lib/seo/pages"

const ELECTION_START = "2026-09-20T08:00:00+02:00"
const ELECTION_END = "2026-09-20T18:00:00+02:00"
const ELECTIONS_INFO_URL = "https://www.berlin.de/wahlen/"

function electionCopy(language: Language) {
  if (language === "de") {
    return {
      name: "Wahl zum Abgeordnetenhaus von Berlin 2026",
      description:
        "Wahl zum Abgeordnetenhaus von Berlin am 20. September 2026. Freie, geheime Wahl des Berliner Landesparlaments.",
      organizerName: "Landeswahlleitung Berlin",
      performerName: "Zur Wahl stehende Parteien und Bewerber:innen",
    }
  }
  if (language === "ru") {
    return {
      name: "Земельные выборы в Берлине 2026",
      description:
        "Выборы в Палату депутатов Берлина (Abgeordnetenhaus) 20 сентября 2026 года. Свободные выборы земельного парламента.",
      organizerName: "Избирательная комиссия Берлина (Landeswahlleitung)",
      performerName: "Партии и кандидаты, участвующие в выборах",
    }
  }
  if (language === "tr") {
    return {
      name: "2026 Berlin Eyalet Meclisi seçimleri",
      description:
        "20 Eylül 2026’da Berlin Temsilciler Meclisi (Abgeordnetenhaus) seçimleri. Berlin eyalet parlamentosunun serbest seçimi.",
      organizerName: "Berlin Eyalet Seçim Kurulu (Landeswahlleitung)",
      performerName: "Seçime katılan partiler ve adaylar",
    }
  }
  return {
    name: "2026 Berlin Abgeordnetenhaus election",
    description:
      "Election to the Berlin House of Representatives (Abgeordnetenhaus) on 20 September 2026. Free election of Berlin’s state parliament.",
    organizerName: "Berlin State Returning Office (Landeswahlleitung)",
    performerName: "Parties and candidates standing in the election",
  }
}

export function JsonLd({ language }: { language: Language }) {
  const t = getTranslations(language)
  const url = buildAbsoluteUrl(language, "")
  const sharing = homeSharingMeta(t)
  const election = electionCopy(language)
  const eventImage = `${BASE_URL}/${language}/opengraph-image`

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "Berlin 2026",
        inLanguage: ["en", "de", "tr", "ru"],
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
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: eventImage,
        },
        about: {
          "@type": "Event",
          "@id": `${BASE_URL}/#abgeordnetenhaus-election-2026`,
          name: election.name,
          description: election.description,
          startDate: ELECTION_START,
          endDate: ELECTION_END,
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          isAccessibleForFree: true,
          image: [eventImage],
          location: {
            "@type": "Place",
            name: "Berlin",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Berlin",
              addressRegion: "Berlin",
              addressCountry: "DE",
            },
          },
          organizer: {
            "@type": "Organization",
            name: election.organizerName,
            url: ELECTIONS_INFO_URL,
          },
          performer: {
            "@type": "Organization",
            name: election.performerName,
          },
          offers: {
            "@type": "Offer",
            name:
              language === "de"
                ? "Teilnahme an der Wahl"
                : language === "ru"
                  ? "Участие в голосовании"
                  : language === "tr"
                    ? "Seçime katılım (oy hakkı olanlar)"
                    : "Voting (eligible voters)",
            price: 0,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: ELECTIONS_INFO_URL,
            validFrom: "2026-01-01T00:00:00+01:00",
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
