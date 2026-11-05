/** Google My Maps from water4all — language-specific layers. */
export const MAP_URLS = {
  ENGLISH_MAP:
    "https://www.google.com/maps/d/edit?mid=1Vu1ecwzIo0W7WEs8MIbz49hOJZSgoZY&usp=sharing",
  GERMAN_MAP:
    "https://www.google.com/maps/d/edit?mid=1v5s3GJCaaJwk2WRFqHz3XiBXYEIuw1Y&usp=sharing",
  RUSSIAN_MAP:
    "https://www.google.com/maps/d/edit?mid=1FJ8sStgRRpony1CRlLuiDRMttrjOhUg&usp=sharing",
  ENGLISH_MAP_EMBED:
    "https://www.google.com/maps/d/embed?mid=1Vu1ecwzIo0W7WEs8MIbz49hOJZSgoZY",
  GERMAN_MAP_EMBED:
    "https://www.google.com/maps/d/embed?mid=1v5s3GJCaaJwk2WRFqHz3XiBXYEIuw1Y",
  RUSSIAN_MAP_EMBED:
    "https://www.google.com/maps/d/embed?mid=1FJ8sStgRRpony1CRlLuiDRMttrjOhUg",
} as const

/** Berlin center + zoom; ehbc tints the My Maps header to brand blue. */
const EMBED_VIEW = "ll=52.520008,13.404954&z=12&ehbc=0B8FBF"

function withEmbedView(baseUrl: string): string {
  return `${baseUrl}&${EMBED_VIEW}`
}

export function getMapEmbedUrl(language: string): string {
  switch (language) {
    case "de":
      return withEmbedView(MAP_URLS.GERMAN_MAP_EMBED)
    case "ru":
      return withEmbedView(MAP_URLS.RUSSIAN_MAP_EMBED)
    case "en":
    default:
      return withEmbedView(MAP_URLS.ENGLISH_MAP_EMBED)
  }
}

export function getMapEditUrl(language: string): string {
  switch (language) {
    case "de":
      return MAP_URLS.GERMAN_MAP
    case "ru":
      return MAP_URLS.RUSSIAN_MAP
    case "en":
    default:
      return MAP_URLS.ENGLISH_MAP
  }
}
