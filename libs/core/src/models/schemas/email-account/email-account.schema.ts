import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailAccountDocument = EmailAccount & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
  },
})
export class EmailAccount {
  @Prop({
    type: Types.ObjectId,
    required: true,
    ref: 'User',
  })
  user: string;
  
  @Prop({
    type: String,
    required: true,
    enum: ['sendgrid', 'mailgun']
  })
  service: string;

  @Prop({
    type: String,
  })
  options: any;

  @Prop({
    type: Boolean,
    required: true,
    default: false,
    select: false,
  })
  deleted: boolean;
}

const EmailAccountSchema = SchemaFactory.createForClass(EmailAccount);

export { EmailAccountSchema };
