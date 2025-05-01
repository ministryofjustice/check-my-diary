import type {
  NotificationDto,
  ShiftDto,
  UpdateNotificationDetailsRequest,
  UpdateSnoozeUntilRequest,
} from 'cmdApiClient'
import { format } from 'date-fns'
import NotificationClient from '../data/notificationClient'

export default class NotificationService {
  constructor(private readonly notificationClient: NotificationClient) {}

  public async getNotifications(
    accessToken: string,
    processOnRead = true,
    unprocessedOnly = false,
  ): Promise<Array<NotificationDto>> {
    return this.notificationClient.getNotifications(accessToken, processOnRead, unprocessedOnly)
  }

  public async getPreferences(accessToken: string): Promise<NotificationDto> {
    return this.notificationClient.getPreferences(accessToken)
  }

  public async updatePreferences(
    accessToken: string,
    preference: UpdateNotificationDetailsRequest['preference'],
    email: string,
    sms: string,
  ): Promise<ShiftDto> {
    return this.notificationClient.updatePreferences(accessToken, preference, email, sms)
  }

  public async updateSnooze(
    accessToken: string,
    snoozeUntil: UpdateSnoozeUntilRequest,
  ): Promise<UpdateNotificationDetailsRequest> {
    return this.notificationClient.updateSnooze(accessToken, snoozeUntil)
  }

  public async resumeNotifications(accessToken: string): Promise<UpdateNotificationDetailsRequest> {
    return this.updateSnooze(accessToken, format(new Date(), 'yyyy-MM-dd'))
  }
}
