/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { DatabaseService } from '../_lib/database/database.service';
import {
  TestCoreModule,
  signInStub,
  signUpStub,
  AuthUserSub,
  verifyEmailStub,
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
      imports: [AuthModule, TestCoreModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ResponseFilter());
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dbConnection = moduleFixture
      .get<DatabaseService>(DatabaseService)
      .getDbHandle();
    httpServer = app.getHttpServer();

    const verifyEmailResponse = await request(httpServer)
      .post('/auth/verify-email')
      .send({
        email: verifyEmailStub.email,
        verificationCode: verifyEmailStub.verificationCode,
      });

    const response = await request(httpServer)
      .post('/auth/password-reset')
      .send({ email: signUpStub.email });
  });

  afterAll(async () => {
    await Promise.all([
      dbConnection.collection('auths').drop(),
      dbConnection.collection('users').drop(),
    ]);
  });
  describe('/auth/reset-password (POST) resetPassword', () => {
    it('Should test resetPassword with invalid user', async () => {
      const response = await request(httpServer)
        .post('/auth/reset-password')
        .send({
          email: 'dummy3email@gmail.com',
          verificationCode: '1111',
          password: signInStub.password,
        });
      expect(response.status).toBe(404);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta).toHaveProperty('statusCode');
      expect(response.body.meta).toHaveProperty('error');
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.statusCode).toBe(404);
      expect(response.body.meta.error.code).toBe(404);
      expect(response.body.meta.error.message).toBe('Data not found');
    });
    it('Should test resetPassword with invalid verification code', async () => {
      const response = await request(httpServer)
        .post('/auth/reset-password')
        .send({
          email: verifyEmailStub.email,
          verificationCode: '2323',
          password: 'newpassword',
        });
      expect(response.status).toBe(401);
      expect(response.body.meta.statusCode).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.error.code).toBe(401);
      expect(response.body.meta.error.message).toBe(
        'Invalid verification code',
      );
    });
    it('Should test resetPassword with valid verification code', async () => {
      const response = await request(httpServer)
        .post('/auth/reset-password')
        .send({
          email: verifyEmailStub.email,
          verificationCode: verifyEmailStub.verificationCode,
          password: 'newpassword',
        });

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
      expect(response.body.data.email).toEqual(verifyEmailStub.email);
    });
    it('Should test resetPassword after reset', async () => {
      const response = await request(httpServer).post('/auth/sign-in').send({
        username: verifyEmailStub.email,
        password: AuthUserSub.password,
      });
      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta).toHaveProperty('statusCode');
      expect(response.body.meta.statusCode).toBe(401);
      expect(response.body.meta).toHaveProperty('error');
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.error).toHaveProperty('statusCode');
      expect(response.body.meta.error.statusCode).toBe(401);
      expect(response.body.meta.error.error).toBe('Unauthorized');
      expect(response.body.meta.error.message).toBe('Invalid credentials');
    });
  });
});
