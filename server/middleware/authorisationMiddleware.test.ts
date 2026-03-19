import type { Request, Response } from 'express'

import authorisationMiddleware from './authorisationMiddleware'

function createUser(roles: string[]) {
  return {
    authSource: 'nomis',
    username: 'test-username',
    name: 'Test User',
    displayName: 'Test User',
    userRoles: roles,
  }
}

describe('authorisationMiddleware', () => {
  const req = {} as unknown as Request
  const next = jest.fn()

  function createResWithUser(roles: string[]): Response {
    return {
      locals: {
        user: createUser(roles),
      },
      redirect: jest.fn(),
    } as unknown as Response
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should return next when no required roles', () => {
    const res = createResWithUser([])

    authorisationMiddleware()(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should redirect when user has no authorised roles', () => {
    const res = createResWithUser([])

    authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalledWith('/authError')
  })

  it('should return next when user has authorised role', () => {
    const res = createResWithUser(['ROLE_SOME_REQUIRED_ROLE'])

    authorisationMiddleware(['SOME_REQUIRED_ROLE'])(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should return next when user has authorised role and middleware created with ROLE_ prefix', () => {
    const res = createResWithUser(['ROLE_SOME_REQUIRED_ROLE'])

    authorisationMiddleware(['ROLE_SOME_REQUIRED_ROLE'])(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })
})
