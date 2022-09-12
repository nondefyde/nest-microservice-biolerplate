import { InjectConnection } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';
import { AuthUserSub } from '../stubs/auth.stub';
import * as bcrypt from 'bcrypt';
import { Utils } from 'finfrac/core/shared';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getDbHandle(): Connection {
    this.createAuthUser();
    return this.connection;
  }

  /**
   * Create a fixed user to be used for request across
   */
  async createAuthUser() {
    const hashedPassword = await bcrypt.hash(AuthUserSub?.password, 10);
    let auth: any = await this.connection.collection('auths').insertOne({
      ...AuthUserSub,
      password: hashedPassword,
      publicId: Utils.generateUniqueId('auth'),
    });
    const userPayload = {
      _id: auth._id,
      ...AuthUserSub,
    };
    const user = await this.connection
      .collection('users')
      .insertOne({ ...userPayload, publicId: Utils.generateUniqueId('user') });
    auth = await this.connection
      .collection('auths')
      .findOne({ _id: auth.insertedId });
    return { auth };
  }
}
