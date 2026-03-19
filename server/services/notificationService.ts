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
    username: string,
    processOnRead = true,
    unprocessedOnly = false,
  ): Promise<Array<NotificationDto>> {
    return this.notificationClient.getNotifications(username, processOnRead, unprocessedOnly)
  }

  public async getPreferences(username: string): Promise<NotificationDto> {
    return this.notificationClient.getPreferences(username)
  }

  public async updatePreferences(
    username: string,
    preference: UpdateNotificationDetailsRequest['preference'],
    email: string,
    sms: string,
  ): Promise<ShiftDto> {
    return this.notificationClient.updatePreferences(username, preference, email, sms)
  }

  public async updateSnooze(
    username: string,
    snoozeUntil: UpdateSnoozeUntilRequest,
  ): Promise<UpdateNotificationDetailsRequest> {
    return this.notificationClient.updateSnooze(username, snoozeUntil)
  }

  public async resumeNotifications(username: string): Promise<UpdateNotificationDetailsRequest> {
    return this.updateSnooze(username, format(new Date(), 'yyyy-MM-dd'))
  }
}
