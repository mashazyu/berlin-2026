/**
 * Deterministic repro for vercel/next.js#99114 (extensionless Google Fonts URLs).
 *
 * Google Fonts sometimes answers css2 requests with `/l/font?kit=...` instead of
 * `/s/.../*.woff2`. Unpatched next/font then crashes:
 *   TypeError: Cannot read properties of null (reading '1')
 *
 * Used via NEXT_FONT_GOOGLE_MOCKED_RESPONSES so CI can lock the patched loader
 * without depending on Google's intermittent response shape.
 *
 * Keys must match the exact URLs next/font/google generates for this repo's fonts.
 */
const EXTLESS =
  "https://fonts.gstatic.com/l/font?kit=UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA&skey=c491285d6722e4fa&v=v20"

function face(family, weight, subset) {
  return `/* ${subset} */
@font-face {
  font-family: '${family}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url(${EXTLESS}) format('woff2');
}
`
}

module.exports = {
  "https://fonts.googleapis.com/css2?family=Lora:wght@400..700&display=swap":
    face("Lora", "400 700", "latin") +
    face("Lora", "400 700", "latin-ext") +
    face("Lora", "400 700", "cyrillic"),

  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..1000&display=swap":
    face("DM Sans", "100 1000", "latin") +
    face("DM Sans", "100 1000", "latin-ext"),

  "https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap":
    face("Noto Sans Arabic", "400", "arabic") +
    face("Noto Sans Arabic", "500", "arabic") +
    face("Noto Sans Arabic", "600", "arabic") +
    face("Noto Sans Arabic", "700", "arabic"),

  "https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@200..900&display=swap":
    face("Source Sans 3", "200 900", "latin") +
    face("Source Sans 3", "200 900", "latin-ext") +
    face("Source Sans 3", "200 900", "cyrillic"),
}
