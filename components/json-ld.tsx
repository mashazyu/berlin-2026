import { getTranslations, type Language } from "@/lib/i18n/get-translations"
import {
  BASE_URL,
  SUPPORTED_LANGUAGES,
  buildAbsoluteUrl,
} from "@/lib/seo/constants"
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
      offersName: "Teilnahme an der Wahl",
    }
  }
  if (language === "ru") {
    return {
      name: "Земельные выборы в Берлине 2026",
      description:
        "Выборы в Палату депутатов Берлина (Abgeordnetenhaus) 20 сентября 2026 года. Свободные выборы земельного парламента.",
      organizerName: "Избирательная комиссия Берлина (Landeswahlleitung)",
      performerName: "Партии и кандидаты, участвующие в выборах",
      offersName: "Участие в голосовании",
    }
  }
  if (language === "tr") {
    return {
      name: "2026 Berlin Eyalet Meclisi seçimleri",
      description:
        "20 Eylül 2026’da Berlin Temsilciler Meclisi (Abgeordnetenhaus) seçimleri. Berlin eyalet parlamentosunun serbest seçimi.",
      organizerName: "Berlin Eyalet Seçim Kurulu (Landeswahlleitung)",
      performerName: "Seçime katılan partiler ve adaylar",
      offersName: "Seçime katılım (oy hakkı olanlar)",
    }
  }
  if (language === "uk") {
    return {
      name: "Земельні вибори в Берліні 2026",
      description:
        "Вибори до Палати депутатів Берліна (Abgeordnetenhaus) 20 вересня 2026 року. Вільні вибори земельного парламенту.",
      organizerName: "Виборча комісія Берліна (Landeswahlleitung)",
      performerName: "Партії та кандидати, які беруть участь у виборах",
      offersName: "Участь у голосуванні (для осіб з правом голосу)",
    }
  }
  if (language === "pl") {
    return {
      name: "Wybory do berlińskiego Abgeordnetenhaus 2026",
      description:
        "Wybory do Izby Deputowanych Berlina (Abgeordnetenhaus) 20 września 2026 r. Wolne wybory do parlamentu landowego Berlina.",
      organizerName: "Krajowa Komisja Wyborcza Berlina (Landeswahlleitung)",
      performerName: "Partie i kandydaci startujący w wyborach",
      offersName: "Udział w wyborach (osoby uprawnione)",
    }
  }
  if (language === "ar") {
    return {
      name: "انتخابات مجلس نواب برلين 2026",
      description:
        "انتخابات مجلس نواب برلين (Abgeordnetenhaus) في 20 سبتمبر 2026. انتخابات حرة للبرلمان الإقليمي في برلين.",
      organizerName: "لجنة الانتخابات الإقليمية في برلين (Landeswahlleitung)",
      performerName: "الأحزاب والمرشحون المشاركون في الانتخابات",
      offersName: "المشاركة في التصويت (للناخبين المؤهلين)",
    }
  }
  if (language === "es") {
    return {
      name: "Elecciones al Abgeordnetenhaus de Berlín 2026",
      description:
        "Elección de la Cámara de Representantes de Berlín (Abgeordnetenhaus) el 20 de septiembre de 2026. Elección libre del parlamento regional de Berlín.",
      organizerName: "Oficina electoral del Land de Berlín (Landeswahlleitung)",
      performerName: "Partidos y candidatos que se presentan a las elecciones",
      offersName: "Participación en la votación (personas con derecho a voto)",
    }
  }
  if (language === "ku") {
    return {
      name: "Hilbijartina Abgeordnetenhaus a Berlînê 2026",
      description:
        "Hilbijartina Meclîsa Nûneran a Berlînê (Abgeordnetenhaus) di 20ê Îlonê 2026an de. Hilbijartina azad a parlamanê herêmî yê Berlînê.",
      organizerName: "Ofîsa hilbijartinê ya Land a Berlînê (Landeswahlleitung)",
      performerName: "Partî û berendamên ku di hilbijartinê de beşdar dibin",
      offersName: "Beşdariya di dengdanê de (kesên xwedî mafê dengdanê)",
    }
  }
  return {
    name: "2026 Berlin Abgeordnetenhaus election",
    description:
      "Election to the Berlin House of Representatives (Abgeordnetenhaus) on 20 September 2026. Free election of Berlin’s state parliament.",
    organizerName: "Berlin State Returning Office (Landeswahlleitung)",
    performerName: "Parties and candidates standing in the election",
    offersName: "Voting (eligible voters)",
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
        inLanguage: [...SUPPORTED_LANGUAGES],
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
            name: election.offersName,
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
