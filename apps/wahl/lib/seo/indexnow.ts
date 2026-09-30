/** Public IndexNow key — also hosted at /{key}.txt */
export const INDEXNOW_KEY = "4146222894bf915a0d84522e181a768e"

export function indexNowKeyLocation(baseUrl: string): string {
  return `${baseUrl}/${INDEXNOW_KEY}.txt`
}
