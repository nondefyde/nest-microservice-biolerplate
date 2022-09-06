import * as fs from 'fs';
import * as ejs from 'ejs';
import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SmsJob } from 'finfrac/core/shared';

@Injectable()
export class SmsService {
  constructor(
    readonly config: ConfigService,
    readonly httpService: HttpService,
  ) {}

  public async send(job: SmsJob): Promise<any> {
    try {
      const sms = await this.getTextFromSMSTemplate(job).catch((e) =>
        Logger.error(e),
      );
      const data = {
        to: job.to,
        from: job.from || this.config.get('worker.termii.senderId'),
        sms,
        type: 'plain',
        channel: 'dnd',
      };

      let result;

      const smsService = this.config.get('app.verification.smsService');
      if (smsService == 'termii') {
        result = await this.useTermii(data);
      }
      return result;
    } catch (e) {
      console.log('sms error ', e);
      throw e;
    }
  }

  public getTextFromSMSTemplate(job: SmsJob): Promise<string> {
    const template = `${process.cwd()}/templates/sms/${job.template}.ejs`;
    return new Promise<string>((resolve, reject) => {
      fs.readFile(template, 'utf8', (err, file) => {
        if (err) {
          return reject(new RpcException(err));
        }
        const html = ejs.render(file, job.content);
        return resolve(html);
      });
    });
  }

  public async useTermii(data) {
    const payload = {
      ...data,
      api_key: this.config.get('worker.termii.apikey'),
    };
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      params: { ...payload },
    };
    const res$ = this.httpService.post(
      this.config.get('worker.termii.url'),
      {},
      config,
    );
    const res = await firstValueFrom(res$);
    return res.data;
  }
}
