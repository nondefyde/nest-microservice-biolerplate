/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import mongoose, { Connection } from 'mongoose';
import { DatabaseService } from '../_lib/database/database.service';
import { signUpStub, signInStub, TestCoreModule, AuthUserSub } from '../_lib';
import { ResponseFilter, ValidationPipe } from 'finfrac/core/shared';
import { AuthModule } from '../../src/auth';

describe('Sign In (e2e)', () => {
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
  });
  afterAll(async () => {
    await Promise.all([
      dbConnection.collection('auths').drop(),
      dbConnection.collection('users').drop(),
    ]);
  });
  describe('/auth/sign-in (POST) signIn', () => {
    it('Should test login a auth/user that does not exist or not registered', async () => {
      const response = await request(httpServer).post('/auth/sign-in').send({
        username: 'dummyemail@gmail.com',
        password: 'loremipsum',
      });
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
      expect(response.body.meta.error.message).toBe('Invalid credentials');
    });

    it('Should test login with invalid auth/user login details', async () => {
      const response = await request(httpServer).post('/auth/sign-in').send({
        username: signUpStub.email,
        password: signInStub.password,
      });
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
      expect(response.body.meta.error.message).toBe('Invalid credentials');
    });
    it('Should test login with valid request data(email and password)', async () => {
      const response = await request(httpServer).post('/auth/sign-in').send({
        username: AuthUserSub.email,
        password: AuthUserSub.password,
      });
      console.log({data: response.body.data})
      expect(response.status).toBe(200);
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta).toHaveProperty('token');
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body.meta.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('verifications');
      expect(response.body.data).toHaveProperty('publicId');
      // expect(response.body.data).toHaveProperty('verificationCodes');
      expect(response.body.data).toHaveProperty('_id');
    });

  });
});
