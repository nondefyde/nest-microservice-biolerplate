import { MailOption } from '@shared/core';

export class AuthEmail {
  static async verifyEmail(config, auth): Promise<MailOption> {
    if (!auth.email) {
      return null;
    }
    return {
      emailName: {
        email: auth.email,
      },
      fromEmail: {
        email: config.from,
      },
      subject: config.subject || 'Email Verification',
      template: config.template,
      content: {
        type: config.type || 'email',
        code: config.verificationCodes,
        email: auth.email,
      },
    };
  }
}
