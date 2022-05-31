import auth from '../mockApis/auth'
import { resetStubs } from '../mockApis/wiremock'

import prisonOfficerApi from '../mockApis/prisonOfficerApi'
import notificationService from '../mockApis/notificationService'
import tokenVerification from '../mockApis/tokenVerification'

import db from '../db/db'

export default (on: (string, Record) => void): void => {
  on('task', {
    reset: () => Promise.all([db.clearDb(), resetStubs()]),
    ...auth,
    ...db,
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
}
