import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as ejs from 'ejs';

import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AppException } from 'finfrac/core/shared';

@Injectable()
export class EmailService {
  constructor(
    protected config: ConfigService,
    readonly httpService: HttpService,
  ) {}

  /**
   * @function
   * @param {object} options the options object
   * @return {function} the email send function
   */
  async sendEmail(options) {
    if (this.config.get('app.environment') === 'test') {
      return;
    }
    if (this.config.get('worker.email.mailOption') === 'postmark') {
      return this.usePostMark(options);
    }
    return this.useSendGrid(options);
  }

  /**
   * @function
   * @param {Object} options the options object
   * @return {function} the email send function
   */
  async useSendGrid(options: any) {
    try {
      if (!options.recipients && !options.templateId && !options.template) {
        throw AppException.INTERNAL_SERVER('Email options validation error');
      }
      sgMail.setApiKey(`${this.config.get('worker.email.sendgrid.apiKey')}`);
      sgMail.setSubstitutionWrappers('{{', '}}');
      const message: any = {
        to: options.recipients || options.to,
        from: options.from || this.config.get('app.from'),
        subject: options.subject || this.config.get('app.appName'),
      };
      if (options.template) {
        message['html'] = await this.getHtmlFromEmailTemplate(
          options.content,
          options.template,
        );
      } else {
        message['templateId'] = options.templateId;
      }
      if (options.attachments && options.attachments.length > 0) {
        message.attachments = options.attachments;
      }
      if (options.substitutions) {
        message.dynamic_template_data = Object.assign(
          {},
          options.substitutions,
          {
            appName: this.config.get('app.name'),
          },
        );
      }
      return sgMail.send(message);
    } catch (e) {
      console.log('email error : ', e);
      throw e;
    }
  }

  /**
   * @function
   * @param {Object} options the options object
   * @return {function} the email send function
   */
  async usePostMark(options: any) {
    try {
      if (!options.recipients && !options.templateId && !options.template) {
        throw AppException.INTERNAL_SERVER('Email options validation error');
      }
      const message: any = {
        To: options?.to?.email,
        From:
          options.from.email ||
          this.config.get('worker.email.postmark.fromEmail'),
        Subject: options.subject || this.config.get('app.appName'),
      };
      if (options.template) {
        message['HtmlBody'] = await this.getHtmlFromEmailTemplate(
          options.content,
          options.template,
        );
      } else {
        message['TemplateId'] = options.templateId;
        message['TemplateModel'] = {
          user_name: 'Stanley Ogbuchi',
        };
      }
      if (options.attachments && options.attachments.length > 0) {
        message.Attachments = [options.attachments];
      }
      if (options.substitutions) {
        message.dynamic_template_data = Object.assign(
          {},
          options.substitutions,
          {
            appName: this.config.get('app.name'),
          },
        );
      }
      message['MessageStream'] = 'outbound';
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': this.config.get(
            'worker.email.postmark.apiKey',
          ),
        },
      };
      const res = await lastValueFrom(
        this.httpService.post(
          this.config.get('worker.email.postmark.url'),
          message,
          config,
        ),
      );
      return res.data;
    } catch (e) {
      console.log('email error >>>>>>>>>> : ', e.response);
      throw e;
    }
  }

  async getHtmlFromEmailTemplate(content, templateValue) {
    try {
      const template = `${process.cwd()}/templates/emails/${templateValue}.ejs`;
      return new Promise((resolve, reject) => {
        fs.readFile(template, 'utf8', (err, file) => {
          if (err) {
            throw err;
          }
          const html = ejs.render(file, {
            ...content,
          });
          return resolve(html);
        });
      });
    } catch (e) {
      console.log('email :::: ', e);
      throw e;
    }
  }
}
