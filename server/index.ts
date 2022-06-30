import promClient from 'prom-client'
import { createMetricsApp } from './monitoring/metricsApp'
import createApp from './app'
import createSignInService from './authentication/signInService'
import { services } from './services'

promClient.collectDefaultMetrics()
// pass in dependencies of service
const app = createApp({
  signInService: createSignInService(),
  services: services(),
})
const metricsApp = createMetricsApp()

export { app, metricsApp }
