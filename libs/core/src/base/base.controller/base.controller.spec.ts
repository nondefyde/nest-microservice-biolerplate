import { INestApplication } from '@nestjs/common';
import { BaseController, BaseService } from 'core/core/base';
import { NextFunction } from 'express';

describe('Base.controller', () => {
  let app: INestApplication;
  let baseController: BaseController;
  let baseService: BaseService;
  let request;
  let response;
  const next: NextFunction = jest.fn();
});
