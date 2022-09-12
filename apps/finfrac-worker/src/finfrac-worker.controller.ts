import { Controller, Get } from '@nestjs/common';
import { Connection } from 'mongoose';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  MicroserviceHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';

@Controller()
export class FinfracWorkerController {
  constructor(
    private health: HealthCheckService,
    private service: MicroserviceHealthIndicator,
    private mongoService: MongooseHealthIndicator,
    @InjectConnection()
    private readonly connection: Connection,
    private config: ConfigService,
  ) {}

  @Get('/ping')
  @HealthCheck()
  async checkService() {
    const pingCheck = await this.health.check([
      () =>
        Promise.resolve<HealthIndicatorResult>({
          worker: {
            app: this.config.get('app.appName'),
            status: 'up',
            environment: this.config.get('app.environment'),
          },
        }),
      () =>
        this.mongoService.pingCheck('mongoDB', {
          connection: this.connection,
        }),
    ]);
    return pingCheck;
  }
}
