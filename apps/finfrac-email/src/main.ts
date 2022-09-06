import { NestFactory } from '@nestjs/core';
import { FinfracEmailModule } from './finfrac-email.module';

async function bootstrap() {
  const app = await NestFactory.create(FinfracEmailModule);
  await app.listen(3000);
}
bootstrap();
