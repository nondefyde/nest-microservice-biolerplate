import { Module } from '@nestjs/common';
import { SendgridService } from './services/sendgrid.service';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailAccount, EmailAccountSchema } from 'finfrac/core/models';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailAccount.name, schema: EmailAccountSchema },
    ]),
  ],
  providers: [SendgridService]
})
export class SendgridModule {}
