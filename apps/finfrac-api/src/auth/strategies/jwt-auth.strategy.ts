import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Auth, AuthDocument } from 'finfrac/core/models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppException } from 'finfrac/core/shared';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectModel(Auth.name) protected readonly model: Model<AuthDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('app.encryption_key'),
    });
  }

  async validate(payload: any) {
    const auth = await this.model.findById(payload.sub);
    if (!auth) {
      throw AppException.INVALID_TOKEN();
    }
    return {
      ...auth.toJSON(),
      authId: auth._id,
    };
  }
}
