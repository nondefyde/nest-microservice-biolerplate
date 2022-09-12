import { Module } from '@nestjs/common';
import { JobController } from './job.controller';
import { EmailService } from './email/email.service';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms/sms.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'finfrac/core/models';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpModule,
  ],
  controllers: [JobController],
  providers: [EmailService, SmsService],
  exports: [],
})
export class JobModule {}
