import { Module } from '@nestjs/common';
import { FinfracEmailController } from './finfrac-email.controller';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { FinfracEmailService } from "./sendgrid/finfrac-email.service";
import { CoreModule } from 'finfrac/core';

@Module({
  imports: [SendgridModule, CoreModule],
  controllers: [FinfracEmailController],
  providers: [FinfracEmailService],
})
export class FinfracEmailModule {}
