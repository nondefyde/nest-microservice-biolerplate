import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseService } from './database.service';
import { configuration } from '@config';
import {
  FileUploadService,
  JobService,
  WorkService,
} from 'finfrac/core/service';
import { WORKER_PROVIDERS } from 'finfrac/core/shared';
console.log({ 'worker provider:::': WORKER_PROVIDERS });

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['_env/.env.test'],
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const dbUrl = config.get('app.mongodb.url');
        return {
          uri: dbUrl,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    ...WORKER_PROVIDERS,
    DatabaseService,
    FileUploadService,
    WorkService,
    JobService,
  ],
  exports: [
    ...WORKER_PROVIDERS,
    DatabaseService,
    FileUploadService,
    WorkService,
    JobService,
  ],
})
export class TestCoreModule {}
