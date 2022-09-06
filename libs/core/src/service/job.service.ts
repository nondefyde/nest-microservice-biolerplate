import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AppException, Job, QueueTasks } from 'finfrac/core/shared';

@Injectable()
export class JobService {
  constructor(
    @Inject('WORKER_SERVICE_TOKEN')
    private readonly client: ClientProxy,
  ) {}

  public addJobToQueue(task: QueueTasks, job: Job) {
    Logger.log(`Sent Job::::${job.queueName} Task:${task}`);

    this.client.send(task, job).subscribe((res) => {
      Logger.log(
        `Finished Job:::: ${job.queueName}, Task:${task} in ${res.duration}`,
      ),
        (e) => {
          console.log('job e ::::: ', e);
          Logger.error(
            new AppException(HttpStatus.INTERNAL_SERVER_ERROR, e, [
              `App error code`,
            ]),
          );
        };
    });
  }
}
