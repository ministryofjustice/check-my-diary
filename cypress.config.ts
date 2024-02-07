import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/wiremock'
import auth from './integration_tests/mockApis/auth'
import notificationService from './integration_tests/mockApis/notificationService'
import prisonOfficerApi from './integration_tests/mockApis/prisonOfficerApi'
import tokenVerification from './integration_tests/mockApis/tokenVerification'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 60000,
  viewportWidth: 1024,
  viewportHeight: 768,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: () => Promise.all([resetStubs()]),
        ...auth,
        ...notificationService,
        ...prisonOfficerApi,
        ...tokenVerification,
        stubNotifications: () =>
          Promise.all([
            notificationService.stubNotificationPreferencesGet(),
            notificationService.stubNotificationUpdate(),
            notificationService.stubNotificationGet(),
          ]),
        stubLoginPage: auth.redirect,
      })
    },
    baseUrl: 'http://localhost:3005',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
