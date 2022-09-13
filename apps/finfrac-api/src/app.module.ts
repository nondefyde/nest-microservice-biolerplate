import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@config';
import { CoreModule } from 'finfrac/core';
import { ApiMiddleware } from 'finfrac/core/shared';
import { UserModule } from './user';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['_env/api/.env.local', '_env/.env'],
      load: [configuration]
    }),
    CoreModule,
    TerminusModule,
    AuthModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(ApiMiddleware).forRoutes('*');
  }
}
