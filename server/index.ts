import promClient from 'prom-client'
import { createMetricsApp } from './monitoring/metricsApp'
import createApp from './app'
import createSignInService from './authentication/signInService'

promClient.collectDefaultMetrics()
// pass in dependencies of service
const app = createApp({
  signInService: createSignInService(),
})
const metricsApp = createMetricsApp()

export { app, metricsApp }
