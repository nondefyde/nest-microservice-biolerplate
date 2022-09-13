import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { BaseService, User, UserDocument } from 'finfrac/core';

@Injectable()
export class UserService extends BaseService {
  constructor(
    @InjectModel(User.name) protected model: Model<UserDocument>,
    protected config: ConfigService
  ) {
    super(model);
  }
}
