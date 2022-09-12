/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { DatabaseService } from '../_lib/database/database.service';
import {
  TestCoreModule,
  signInStub,
  // verifyMobileStub,
  verifyEmailStub,
  AuthUserSub,
} from '../_lib';
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
      imports: [TestCoreModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ResponseFilter());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dbConnection = moduleFixture
      .get<DatabaseService>(DatabaseService)
      .getDbHandle();
    httpServer = app.getHttpServer();

    const user = await request(httpServer).post('/auth/sign-in').send({
      username: AuthUserSub.email,
      password: AuthUserSub.password,
    });

    tokenEmail = user.body.meta.token;
  });
  afterAll(async () => {
    await Promise.all([
      dbConnection.collection('auths').drop(),
      dbConnection.collection('users').drop(),
    ]);
  });
  describe('/auth/change-password (POST) changePassword', () => {
    it('Should test changePassword with invalid authentication', async () => {
      const response = await request(httpServer)
        .post('/auth/change-password')
        .set('Authorization', `Bearer hjvbkjbjlsbvonkwlnlk`)
        .send({});

      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta).toHaveProperty('statusCode');
      expect(response.body.meta).toHaveProperty('error');
      expect(response.body.meta.statusCode).toBe(401);
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.error).toHaveProperty('statusCode');
      expect(response.body.meta.error).toHaveProperty('message');
      expect(response.body.meta.error.statusCode).toBe(401);
      expect(response.body.meta.error.message).toBe('Unauthorized');
    });
    it('Should not change Password with invalid current password data', async () => {
      const response = await request(httpServer)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${tokenEmail}`)
        .send({
          currentPassword: signInStub.password,
          password: verifyEmailStub.password,
        });

      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta).toHaveProperty('statusCode');
      expect(response.body.meta.statusCode).toBe(401);
      expect(response.body.meta).toHaveProperty('error');
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.error).toHaveProperty('code');
      expect(response.body.meta.error.code).toBe(401);
      expect(response.body.meta.error.message).toBe('Invalid credentials');
    });

    it('Should test changePassword with valid request data', async () => {
      const response = await request(httpServer)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${tokenEmail}`)
        .send({
          currentPassword: AuthUserSub.password,
          password: verifyEmailStub.password,
        });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body).toHaveProperty('data');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('success');
      expect(response.body.meta.success).toBe(true);
      expect(response.body.data.success).toBe(true);
      expect(response.body.data.email).toEqual(verifyEmailStub.email);
    });
  });
});
