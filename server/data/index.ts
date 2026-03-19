/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { AuthenticationClient, InMemoryTokenStore, RedisTokenStore } from '@ministryofjustice/hmpps-auth-clients'
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()
initialiseAppInsights()
buildAppInsightsClient(applicationInfo)

import CalendarClient from './calendarClient'
import NotificationClient from './notificationClient'
import config from '../config'
import logger from '../../logger'
import { createRedisClient } from './redisClient'
import NomisUserRolesApiClient from './nomisUserRolesApiClient'

const hmppsAuthClient = new AuthenticationClient(
  config.apis.hmppsAuth,
  logger,
  config.redis.enabled ? new RedisTokenStore(createRedisClient()) : new InMemoryTokenStore(),
)

export const dataAccess = () => ({
  applicationInfo,
  calendarClient: new CalendarClient(hmppsAuthClient),
  notificationClient: new NotificationClient(hmppsAuthClient),
  nomisUserRolesApiClient: new NomisUserRolesApiClient(hmppsAuthClient),
})

export type DataAccess = ReturnType<typeof dataAccess>
