import { Module } from '@nestjs/common';
import { FinfracWorkerController } from './finfrac-worker.controller';
import { FinfracWorkerService } from './finfrac-worker.service';

@Module({
  imports: [],
  controllers: [FinfracWorkerController],
  providers: [FinfracWorkerService],
})
export class FinfracWorkerModule {}
