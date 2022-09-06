import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MGSchema } from 'mongoose';

export type AuthDocument = Auth & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
  },
})
export class Auth {
  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  publicId: string;

  @Prop({
    type: String,
    email: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: {
      phoneNumber: String,
      isoCode: {
        type: String,
        default: 'NG',
      },
    },
  })
  mobile: string;

  @Prop({
    type: String,
    select: false,
  })
  password: string;

  @Prop(
    raw({
      email: {
        type: Boolean,
        default: false,
      },
      mobile: {
        type: Boolean,
        default: false,
      },
    }),
  )
  verifications: any;

  @Prop({
    type: MGSchema.Types.Mixed,
  })
  verificationCodes: any;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;
}

const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.statics.config = () => {
  return {
    idToken: 'auth',
    uniques: ['email'],
    fillables: [],
    updateFillables: [],
    hiddenFields: ['deleted', 'password'],
  };
};

AuthSchema.virtual('user', {
  ref: 'User',
  localField: '_id',
  foreignField: '_id',
  justOne: true,
  match: {
    deleted: false,
  },
});

export { AuthSchema };
