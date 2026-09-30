const LANGS = [
  "en",
  "de",
  "tr",
  "ku",
  "vi",
  "pl",
  "ru",
  "uk",
  "ar",
  "es",
  "it",
] as const

const CONTENT_LANG: Record<(typeof LANGS)[number], string> = {
  en: "en-DE",
  de: "de-DE",
  tr: "tr-DE",
  ku: "ku-DE",
  vi: "vi-DE",
  pl: "pl-DE",
  ru: "ru-DE",
  uk: "uk-DE",
  ar: "ar-DE",
  es: "es-DE",
  it: "it-DE",
}

describe("localized pages", () => {
  for (const lang of LANGS) {
    it(`home /${lang} loads with comparison`, () => {
      cy.visit(`/${lang}`, { failOnStatusCode: true })
      cy.document().its("documentElement.lang").should("eq", CONTENT_LANG[lang])
      cy.get("#comparison").should("exist")
      cy.get("#comparison h2, #comparison h3, #comparison h4").should(
        "have.length.at.least",
        1,
      )
    })

    it(`about /${lang}/about loads`, () => {
      cy.visit(`/${lang}/about`, { failOnStatusCode: true })
      cy.document().its("documentElement.lang").should("eq", CONTENT_LANG[lang])
      cy.get("main").should("exist")
    })
  }

  it("privacy for non-en/de redirects to German", () => {
    cy.visit("/tr/privacy", { failOnStatusCode: false })
    cy.location("pathname").should("eq", "/de/privacy")
  })

  it("impressum for non-en/de redirects to German", () => {
    cy.visit("/pl/impressum", { failOnStatusCode: false })
    cy.location("pathname").should("eq", "/de/impressum")
  })
})
