import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';
import { ResponseFilter } from 'finfrac/core/shared';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: true,
  });
  app.use(morgan('tiny'));
  app.setGlobalPrefix('v1');
  app.useGlobalFilters(new ResponseFilter());
  app.useGlobalPipes(new ValidationPipe());
  const config = app.get(ConfigService);
  
  await app.listen(config.get('app.port'), () =>
    Logger.log(
      `Api Service is listening at port ${config.get('app.port')} ...`,
    ),
  );
}

bootstrap();
