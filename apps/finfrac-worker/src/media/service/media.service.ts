import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Media, MediaDocument } from 'finfrac/core/models';
import { BaseService } from 'finfrac/core/base';

@Injectable()
export class MediaService extends BaseService {
  constructor(
    @InjectModel(Media.name) protected model: Model<MediaDocument>,
    protected config: ConfigService,
  ) {
    super(model);
  }

  /**
   * @param {Object} obj The payload object
   * @return {Object}
   */
  public async createNewObject(obj) {
    return new this.model({
      ...obj
    }).save();
  }
}
