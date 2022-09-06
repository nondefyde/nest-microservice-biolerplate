import { Module } from '@nestjs/common';
import { FinfracWorkerController } from './finfrac-worker.controller';
import { ConfigModule } from '@nestjs/config';
import { configuration } from '@config';
import { CoreModule } from 'finfrac/core';
import { MediaModule } from './media/media.module';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '_env/worker/.env.local',
        '_env/.env'
      ],
      load: [configuration]
    }),
    TerminusModule,
    CoreModule,
    MediaModule
  ],
  controllers: [FinfracWorkerController],
  providers: [],
})
export class FinfracWorkerModule {}
