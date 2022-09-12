import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { DatabaseService } from './database.service';
import { configuration } from '@config';

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
    DatabaseService,
  ],
  exports: [
    DatabaseService,
  ],
})
export class TestCoreModule {}
