import { NestFactory } from '@nestjs/core';
import { FinfracWorkerModule } from './finfrac-worker.module';

async function bootstrap() {
  const app = await NestFactory.create(FinfracWorkerModule);
  await app.listen(3000);
}
bootstrap();
