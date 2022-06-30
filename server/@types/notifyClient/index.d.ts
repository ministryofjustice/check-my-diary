declare module 'notifications-node-client' {
  export default class NotifyClient {
    constructor(url: string, clientKey: string): NotifyClient

    constructor(clientKey: string): NotifyClient

    sendSms(templateId: string, phoneNumber: string, options: { personalisation: { '2fa_code': number } }): Promise

    sendEmail(templateId: string, emailAddress: string, options: { personalisation: { '2fa_code': number } }): Promise
  }
}
