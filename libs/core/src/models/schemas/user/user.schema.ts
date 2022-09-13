import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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
    uniques: ['email'],
    fillables: [],
    updateFillables: [
      'firstName',
      'lastName',
      'gender',
      'avatar',
      'dob'
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

export { UserSchema };
