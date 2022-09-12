import { Module } from '@nestjs/common';
import { WORKER_PROVIDERS } from 'finfrac/core/shared';
import { JobService, WorkService } from 'finfrac/core/service';

@Module({
  providers: [...WORKER_PROVIDERS, WorkService, JobService],
  exports: [...WORKER_PROVIDERS, WorkService, JobService],
})
export class WorkerModule {}
