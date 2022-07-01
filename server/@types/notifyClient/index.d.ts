declare module 'notifications-node-client' {
  export interface EmailResponse extends GeneralResponse {
    readonly content: {
      readonly body: string
      readonly from_email: string
      readonly subject: string
    }
  }

  export interface SmsResponse extends GeneralResponse {
    readonly content: {
      readonly body: string
      readonly from_number: string
    }
  }
  export class NotifyClient {
    constructor(url: string, clientKey: string): NotifyClient

    constructor(clientKey: string): NotifyClient

    sendSms(
      templateId: string,
      phoneNumber: string,
      options: { personalisation: { '2fa_code': number } },
    ): Promise<SmsResponse>

    sendEmail(
      templateId: string,
      emailAddress: string,
      options: { personalisation: { '2fa_code': number } },
    ): Promise<EmailResponse>
  }
}
