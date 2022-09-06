type IEmail = {
  email: string
  name?: string,
}

type EmailContent = {
  type: string
  value: string
}

type EmailAttachment = {
  content: string
  filename: string
  type: string
  disposition: string
}

type TrackingSettings = {
  clickTracking: {
    enable: boolean,
    enableText: boolean,
  },
  openTracking: {
    enable: boolean,
    substitutionTag: string
  },
  subscriptionTracking: {
    enable: boolean
  }
}

type MailSettings = {
  bypassListManagement: {
    enable: boolean
  },
  footer: {
    enable: boolean
  },
  sandboxMode: {
    enable: boolean
  }
}

interface EmailBasicOptions {
  to: IEmail,
  cc?: IEmail,
  bcc?: IEmail,
  from?: IEmail,
  subject?: string,
  headers?: Record<string, any>,
  substitutions?: Record<string, any>,
  custom_args?: Record<string, any>,
  sendAt?: string
}

export interface EmailOptions extends EmailBasicOptions{
  personalizations?: EmailBasicOptions[],
  replyTo?: IEmail,
  content?: EmailContent[],
  recipients?: [],
  template_id?: string,
  categories?: string[],
  trackingSettings?: TrackingSettings,
  mailSettings?: MailSettings,
  attachments?: EmailAttachment[],
  ipPoolName?: string,
  batchId?: string,
}