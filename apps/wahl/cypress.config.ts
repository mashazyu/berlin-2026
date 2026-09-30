import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://127.0.0.1:3000",
    supportFile: false,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
  },
})
