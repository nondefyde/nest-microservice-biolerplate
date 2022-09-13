/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { DatabaseService } from '../_lib/database/database.service';
import { TestCoreModule, signUpStub } from '../_lib';
import { ResponseFilter, ValidationPipe } from 'finfrac/core/shared';
import { AuthModule } from '../../src/auth';

describe('UsersController (e2e)', () => {
  let x_signed_data;
  const time = Date.now();
  let userid;
  let tokenEmail;
  let tokenMobile;
  let createUser;

  let app: INestApplication;
  let dbConnection: Connection;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, TestCoreModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ResponseFilter());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dbConnection = moduleFixture
      .get<DatabaseService>(DatabaseService)
      .getDbHandle();
    moduleFixture.get<DatabaseService>(DatabaseService).createAuthUser();

    httpServer = app.getHttpServer();
  });
  afterAll(async () => {
    await Promise.all([
      dbConnection.collection('auths').deleteMany({}),
      dbConnection.collection('users').deleteMany({}),
    ]);
  });
  describe('/auth/password-reset (POST) passwordReset', () => {
    it('Should test passwordReset with invalid data', async () => {
      const response = await request(httpServer)
        .post('/auth/password-reset')
        .send({ email: 'dummyemail@gmail.com' });

      expect(response.status).toBe(404);
      expect(response.body.meta.statusCode).toBe(404);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.error.code).toBe(404);
      expect(response.body.meta.error.message).toBe('Data not found');
    });
    it('Should test passwordReset with valid data for email', async () => {
      const response = await request(httpServer)
        .post('/auth/password-reset')
        .send({ email: signUpStub.email });
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('data');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.meta.success).toBe(true);
      expect(response.body.data.success).toBe(true);
    });
  });
});
