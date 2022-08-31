import { Controller, Get } from '@nestjs/common';
import { FinfracWorkerService } from './finfrac-worker.service';

@Controller()
export class FinfracWorkerController {
  constructor(private readonly finfracWorkerService: FinfracWorkerService) {}

  @Get()
  getHello(): string {
    return this.finfracWorkerService.getHello();
  }
}
