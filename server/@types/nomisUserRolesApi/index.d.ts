export interface paths {
  '/users/user': {
    get: operations['findUsersByEmailAddress']
  }
}

export interface components {
  schemas: {
    /** @description User Group Information */
    UserGroupDetail: {
      /** @description Group id @example BXI */
      id: string

      /** @description Group name @example Brixton (HMP) */
      name: string
    }

    /** @description User Information */
    UserDetail: {
      /** @description Username @example testuser1 */
      username: string

      /** @description Staff ID @example 324323 */
      staffId: number

      /** @description First name of the user @example John */
      firstName: string

      /** @description Last name of the user @example Smith */
      lastName: string

      /** @description Active Caseload of the user @example BXI */
      activeCaseloadId?: string

      /** @description Status of the user */
      accountStatus?:
        | 'OPEN'
        | 'EXPIRED'
        | 'EXPIRED_GRACE'
        | 'LOCKED_TIMED'
        | 'LOCKED'
        | 'EXPIRED_LOCKED_TIMED'
        | 'EXPIRED_GRACE_LOCKED_TIMED'
        | 'EXPIRED_LOCKED'
        | 'EXPIRED_GRACE_LOCKED'

      /** @description Type of user account @example GENERAL */
      accountType: 'GENERAL' | 'ADMIN'

      /** @description Email address of the user @example test@test.com */
      primaryEmail?: string

      /** @description List of associated DPS Role Codes */
      dpsRoleCodes: string[]

      /** @description List of user groups administered */
      administratorOfUserGroups: components['schemas']['UserGroupDetail'][]

      /** @description Account is not locked */
      accountNonLocked?: boolean

      /** @description Credentials are not expired */
      credentialsNonExpired?: boolean

      /** @description User is enabled */
      enabled: boolean

      /** @description User is admin flag */
      admin?: boolean

      /** @description User is active */
      active: boolean

      /** @description Staff Status @example ACTIVE */
      staffStatus?: string

      /**
       * Format: date-time
       * @description Last logon date
       * @example 2023-01-01T12:13:14.123
       */
      lastLogonDate?: string
    }
  }
}

export interface operations {
  /** GET /users/user */
  findUsersByEmailAddress: {
    parameters: {
      query: {
        /** @description The email to match. Case insensitive @example jim@smith.com */
        email: string
      }
    }
    responses: {
      /** OK */
      200: {
        content: {
          'application/json': components['schemas']['UserDetail'][]
        }
      }
    }
  }
}
