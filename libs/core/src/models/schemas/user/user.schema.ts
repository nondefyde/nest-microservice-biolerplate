import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toJSON: { virtuals: true },
  toObject: {
    virtuals: true,
  },
})
export class User {
  @Prop({
    type: String,
    unique: true,
  })
  publicId: string;

  @Prop({
    type: String,
    email: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    type: String,
  })
  firstName: string;

  @Prop({
    type: String,
  })
  lastName: string;

  @Prop({
    type: String,
  })
  middleName: string;

  @Prop({
    type: String,
  })
  dob: string;

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
    lowercase: true,
  })
  avatar: string;

  @Prop({
    type: String,
    enum: ['Male', 'Female'],
  })
  gender: string;

  @Prop({
    type: String,
  })
  bvn: string;

  @Prop({
    type: Object,
  })
  bvnBasic: any;

  @Prop({
    type: Array,
  })
  deviceIds: string[];

  @Prop(
    raw({
      addressLine_1: String,
      addressLine_2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    }),
  )
  address: any;

  @Prop({
    type: Types.ObjectId,
    ref: 'Account',
  })
  account: string;

  @Prop({
    type: Object,
  })
  wallet: any;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics.config = () => {
  return {
    idToken: 'user',
    uniques: ['email', 'mobile', 'bvn'],
    fillables: [],
    updateFillables: [
      'firstName',
      'lastName',
      'middleName',
      'gender',
      'avatar',
      'dob',
      'address',
      'deviceIds',
    ],
    hiddenFields: ['deleted'],
  };
};

UserSchema.virtual('auth', {
  ref: 'Auth',
  localField: '_id',
  foreignField: '_id',
  justOne: true,
  match: {
    deleted: false,
  },
});

UserSchema.virtual('customer', {
  ref: 'Customer',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
  match: {
    deleted: false,
  },
});

export { UserSchema };
