import { Injectable } from '@nestjs/common';

@Injectable()
export class FinfracWorkerService {
  getHello(): string {
    return 'Hello World!';
  }
}
