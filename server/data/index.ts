/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import HmppsAuthClient from './hmppsAuthClient'
import CalendarClient from './calendarClient'
import NotificationClient from './notificationClient'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(),
  calendarClient: new CalendarClient(),
  notificationClient: new NotificationClient(),
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder }
