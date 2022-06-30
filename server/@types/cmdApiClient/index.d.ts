declare module 'cmdApiClient' {
  import { components } from '../cmdApi'

  export type ShiftDto = components['schemas']['ShiftDto']
  export type NotificationDto = components['schemas']['NotificationDto']
  export type UpdateSnoozeUntilRequest = components['schemas']['UpdateSnoozeUntilRequest']
  export type UpdateNotificationDetailsRequest = components['schemas']['UpdateNotificationDetailsRequest']
}
