export type MediaLean = "left" | "center" | "right" | "local"
export type MediaScope = "berlin" | "bund"

export type MediaFeed = {
  id: string
  source: string
  lean: MediaLean
  scope: MediaScope
  url: string
}

/** Curated RSS sources for Abgeordnetenhaus / party coverage. */
export const MEDIA_FEEDS: MediaFeed[] = [
  {
    id: "taz-deutschland",
    source: "taz",
    lean: "left",
    scope: "bund",
    url: "https://taz.de/Politik/Deutschland/!p4616;rss/",
  },
  {
    id: "taz-berlin",
    source: "taz",
    lean: "left",
    scope: "berlin",
    url: "https://taz.de/!p4649;rss/",
  },
  {
    id: "zeit-politik",
    source: "Zeit",
    lean: "center",
    scope: "bund",
    url: "https://newsfeed.zeit.de/politik/index",
  },
  {
    id: "faz-inland",
    source: "FAZ",
    lean: "right",
    scope: "bund",
    url: "https://www.faz.net/rss/aktuell/politik/inland/",
  },
  {
    id: "faz-politik",
    source: "FAZ",
    lean: "right",
    scope: "bund",
    url: "https://www.faz.net/rss/aktuell/politik/",
  },
  {
    id: "tsp-berlin",
    source: "Tagesspiegel",
    lean: "local",
    scope: "berlin",
    url: "https://www.tagesspiegel.de/contentexport/feed/berlin",
  },
  {
    id: "tsp-politik",
    source: "Tagesspiegel",
    lean: "local",
    scope: "bund",
    url: "https://www.tagesspiegel.de/contentexport/feed/politik",
  },
  {
    id: "bmp-berlin",
    source: "Morgenpost",
    lean: "local",
    scope: "berlin",
    url: "https://www.morgenpost.de/berlin/?service=Rss",
  },
]
