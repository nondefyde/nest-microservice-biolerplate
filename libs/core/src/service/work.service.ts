import { Injectable } from '@nestjs/common';
import { JobService } from './job.service';
import { ConfigService } from '@nestjs/config';
import { BasicJob, EmailJob, IEmailName, MailOption, QueueTasks, SmsJob, SmsOption } from 'finfrac/core/shared';

@Injectable()
export class WorkService {
  constructor(
    private readonly config: ConfigService,
    private readonly jobService: JobService,
  ) {}

  queueToSendEmail(option: MailOption) {
    this.handleEmail(
      option.emailName,
      option.fromEmail,
      option.subject,
      option.template,
      option.content,
    );
  }

  queueToSendSms(option: SmsOption) {
    this.handleSMS(option.mobile, option.template, option.content, option.from);
  }

  handleEmail(
    emailName: IEmailName,
    fromEmail: IEmailName,
    subject: string,
    template: string,
    additionalContent: any = {},
  ) {
    const emailJob = new EmailJob()
      .setFrom(fromEmail)
      .setTo(emailName)
      .setSubject(subject)
      .setTemplate(template)
      .setContent(additionalContent);

    this.jobService.addJobToQueue(QueueTasks.SEND_EMAIL, emailJob);
  }

  handleSMS(phone: string, template: string, content: any, from: string) {
    const job = new SmsJob()
      .setFrom(from)
      .setTo(phone)
      .setTemplate(template)
      .setContent(content);

    this.jobService.addJobToQueue(QueueTasks.SEND_SMS, job);
  }

  handleQueuedJob(taskKey: QueueTasks, payload: any) {
    const job = new BasicJob();
    job.setData(payload);
    this.jobService.addJobToQueue(taskKey, job);
  }
}
