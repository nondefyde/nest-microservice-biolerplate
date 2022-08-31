import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });
  app.use(morgan('tiny'));
  app.setGlobalPrefix('v1');

  await app.listen(3000, () =>
    Logger.log(
      `User Service is listening at port ${3000} ...`,
    ),
  );
}

bootstrap();
