import { Test, TestingModule } from '@nestjs/testing';
import { FinfracWorkerController } from './finfrac-worker.controller';
import { FinfracWorkerService } from './finfrac-worker.service';

describe('FinfracWorkerController', () => {
  let finfracWorkerController: FinfracWorkerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FinfracWorkerController],
      providers: [FinfracWorkerService],
    }).compile();

    finfracWorkerController = app.get<FinfracWorkerController>(FinfracWorkerController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(finfracWorkerController.getHello()).toBe('Hello World!');
    });
  });
});
