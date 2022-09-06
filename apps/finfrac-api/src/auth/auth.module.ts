import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { Auth, AuthSchema, User, UserSchema } from '@shared/core';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt-auth.strategy';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          defaultStrategy: 'jwt',
          secret: config.get<string>('app.encryption_key'),
          signOptions: { expiresIn: '60d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
