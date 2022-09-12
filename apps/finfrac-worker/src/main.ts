import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  ResponseFilter,
  WorkerExceptionFilter,
  WorkerQueue,
} from 'finfrac/core/shared';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { FinfracWorkerModule } from './finfrac-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(FinfracWorkerModule, {
    cors: true,
  });
  const config = app.get(ConfigService);

  app.use(morgan('tiny'));
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new WorkerExceptionFilter());
  app.useGlobalFilters(new ResponseFilter());
  app.useGlobalPipes(new ValidationPipe());

  Logger.log(
    `Rabbit server connected at >>>>><<<< : ${config.get('app.rabbitMQ')}`,
  );
  await app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [config.get('app.rabbitMQ')],
      queue: WorkerQueue.PROCESS_WORK,
      queueOptions: { durable: true },
      noAck: true,
    },
  });

  console.log('port >>>>>>>>> : ', config.get('worker.port'));
  await app.listen(config.get(`worker.port`), () =>
    Logger.log(
      `WorkerService is listening... port ${config.get('worker.port')}`,
    ),
  );
  await app.startAllMicroservices();
}
bootstrap();
