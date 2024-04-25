import { Response } from 'superagent'

import { getMatchingRequests, stubFor } from './wiremock'
import tokenVerification from './tokenVerification'
import createToken from '../../server/routes/testutils/createToken'

const getLoginUrl = () =>
  getMatchingRequests({
    method: 'GET',
    urlPath: '/auth/oauth/authorize',
  }).then(data => {
    const { requests } = data.body
    const stateValue = requests[requests.length - 1].queryParams.state.values[0]
    return `/login/callback?code=codexxxx&state=${stateValue}`
  })

const favicon = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=my-diary',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: 'http://localhost:3007/login/callback?code=codexxxx&state=stateyyyy',
      },
      body: '<html><body>Login page<h1>Sign in</h1></body></html>',
    },
  })

const logout = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/logout.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body>Login page<h1>Sign in</h1></body></html>',
    },
  })

const token = ({
  username = 'ITAG_USER',
  employeeName = 'Sarah Itag',
  authorities = [],
}: {
  username: string
  employeeName: string
  authorities: string[]
}) =>
  stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: 'http://localhost:3007/login/callback?code=codexxxx&state=stateyyyy',
      },
      jsonBody: {
        access_token: createToken(username, employeeName, authorities),
        token_type: 'bearer',
        refresh_token: 'refresh',
        sub: username,
        user_name: username,
        expires_in: 600,
        scope: 'read write',
        internalUser: true,
      },
    },
  })

const stubGetMyMfaSettings = ({ backupVerified, mobileVerified, emailVerified }) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me/mfa',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      jsonBody: { backupVerified, mobileVerified, emailVerified },
    },
  })

const stubLogin = (
  arg: { username?: string; employeeName?: string; authorities?: string[] } = {},
): Promise<[Response, Response, Response, Response, Response]> => {
  const { username = 'ITAG_USER', employeeName = 'Sarah Itag', authorities = [] } = arg
  return Promise.all([
    favicon(),
    redirect(),
    logout(),
    token({ username, employeeName, authorities }),
    tokenVerification.stubVerifyToken(),
  ])
}

export default {
  getLoginUrl,
  stubLogin,
  stubAuthPing: ping,
  redirect,
  token,
  stubGetMyMfaSettings,
}
