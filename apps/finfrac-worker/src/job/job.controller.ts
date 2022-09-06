import { Controller, Logger } from '@nestjs/common';
import { EmailService } from './email/email.service';
import { EventPattern } from '@nestjs/microservices';
import { SmsService } from './sms/sms.service';
import { EmailJob, QueueTasks, SmsJob } from 'finfrac/core/shared';

@Controller()
export class JobController {
  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  @EventPattern(QueueTasks.PING)
  public async ping(payload: any) {
    Logger.log(`Ping : ${JSON.stringify(payload)}`);
  }

  @EventPattern(QueueTasks.SEND_EMAIL)
  public async sendEmail(emailJob: EmailJob) {
    Logger.log(`Received email Job:${emailJob.queueName}`);

    await this.emailService.sendEmail(emailJob);
    const payload = {
      queueTask: QueueTasks.SEND_EMAIL,
      body: {
        jobId: emailJob.id,
        subject: emailJob.subject,
        receiver: Array.isArray(emailJob.to)
          ? emailJob.to.map((j) => j.email)
          : emailJob.to.email,
      },
    };

    Logger.log(JSON.stringify(payload));
  }

  @EventPattern(QueueTasks.SEND_SMS)
  public async sendSms(job: SmsJob) {
    Logger.log(`Received sms Job : ${JSON.stringify(job)}`);
    const result = await this.smsService.send(job);
    Logger.log(JSON.stringify(result));
  }
}
