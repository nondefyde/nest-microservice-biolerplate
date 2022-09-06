import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@config';
import { CoreModule } from 'finfrac/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['_env/api/.env.local', '_env/.env'],
      load: [configuration],
    }),
    CoreModule,
    TerminusModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
