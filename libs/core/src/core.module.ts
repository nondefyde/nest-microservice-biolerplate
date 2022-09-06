import { Global, Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from "path";
import { WORKER_PROVIDERS } from 'finfrac/core/shared';
import { FileUploadService, JobService, WorkService } from 'finfrac/core/service';

@Global()
@Module({
  imports: [
    HttpModule,
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          uri: config.get('app.mongodb.url'),
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const dbDefaultType = config.get('app.rdbms.default');
        const dbConfig = config.get('app.rdbms');

        const migrationsDir = dbConfig[dbDefaultType].migrationsDir
          ? path.join(__dirname, dbConfig[dbDefaultType].migrationsDir)
          : path.join(__dirname, '..', 'migrations');

        const migrationsPath = path.join(migrationsDir, '**{.ts,.js}');

        return {
          type: dbDefaultType,
          host: dbConfig[dbDefaultType].host,
          port: dbConfig[dbDefaultType].port,
          username: dbConfig[dbDefaultType].username,
          password: dbConfig[dbDefaultType].password,
          database: dbConfig[dbDefaultType].name,
          entities: [],
          autoLoadEntities: true,
          synchronize: true,
          keepConnectionAlive: false,
          migrations: [migrationsPath],
          cli: {
            migrationsDir: 'src/migrations',
          },
          extra: {
            connectionLimit: 15,
          },
          logging:
            config.get('app.environment') === 'production'
              ? ['error', 'migration', 'warn']
              : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    ...WORKER_PROVIDERS,
    FileUploadService,
    WorkService,
    JobService,
    CoreService,
  ],
  exports: [
    ...WORKER_PROVIDERS,
    FileUploadService,
    WorkService,
    JobService,
  ]
})
export class CoreModule {}
