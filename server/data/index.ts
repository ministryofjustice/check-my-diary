/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import HmppsAuthClient from './hmppsAuthClient'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(),
})

export type DataAccess = ReturnType<typeof dataAccess>

export { HmppsAuthClient, RestClientBuilder }
