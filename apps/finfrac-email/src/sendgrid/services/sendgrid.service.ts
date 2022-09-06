import { Injectable } from '@nestjs/common';
import { EmailConfigOption, EmailOptions } from '../interfaces';
import * as sgMail from '@sendgrid/mail';
import { AppException } from 'finfrac/core/shared';
import { EmailService } from '../abstract/email-service';

@Injectable()
export class SendgridService extends EmailService {
  readonly apiKey: string;
  
  constructor(option: EmailConfigOption) {
    super();
    this.apiKey = option.apiKey;
  }

  async sendEmail(option: EmailOptions) {
    try {
      const validation = await this.validateOptions(option);
      if (validation instanceof AppException) {
        throw validation;
      }
      sgMail.setApiKey(`${this.apiKey}`);
      sgMail.setSubstitutionWrappers('{{', '}}');
      const message: any = {
        to: option.recipients || option.to,
        from: option.from,
        subject: option.subject,
      };
      if (option.content) {
        message['html'] = await this.getHtmlFromEmailTemplate(
          option.substitutions,
          option.content,
        );
      } else {
        message['templateId'] = option.template_id;
      }
      if (option.attachments && option.attachments.length > 0) {
        message.attachments = option.attachments;
      }
      if (option.substitutions) {
        message.dynamic_template_data = Object.assign({}, option.substitutions);
      }
      return sgMail.send(message);
    } catch (e) {
      console.log('Email sendgrid error >>>> ', e);
    }
  }

  async validateOptions(option: EmailOptions) {
    if (!option.recipients && !option.template_id) {
      return AppException.INTERNAL_SERVER('Email options validation error');
    }
    return true;
  }
}
