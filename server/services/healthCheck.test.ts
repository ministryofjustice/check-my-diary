import healthCheck from './healthCheck'
import type { HealthCheckCallback, HealthCheckService } from './healthCheck'

describe('HealthCheck', () => {
  it('HealthCheck reports healthy', (done) => {
    const successfulChecks = [successfulCheck('check1'), successfulCheck('check2')]

    const callback: HealthCheckCallback = (result) => {
      expect(result).toEqual(
        expect.objectContaining({
          healthy: true,
          checks: { check1: 'some message', check2: 'some message' },
        }),
      )
      done()
    }

    healthCheck(callback, successfulChecks)
  })
  it('HealthCheck reports unhealthy', (done) => {
    const successfulChecks = [successfulCheck('check1'), erroredCheck('check2')]

    const callback: HealthCheckCallback = (result) => {
      expect(result).toEqual(
        expect.objectContaining({
          healthy: false,
          checks: { check1: 'some message', check2: 'some error' },
        }),
      )
      done()
    }

    healthCheck(callback, successfulChecks)
  })
})

function successfulCheck(name: string): HealthCheckService {
  return () =>
    new Promise((resolve, _reject) => {
      resolve({
        name: `${name}`,
        status: 'ok',
        message: 'some message',
      })
    })
}

function erroredCheck(name: string): HealthCheckService {
  return () =>
    new Promise((resolve, _reject) => {
      resolve({
        name: `${name}`,
        status: 'ERROR',
        message: 'some error',
      })
    })
}
