/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { DatabaseService } from '../_lib/database/database.service';
import { signUpStub, TestCoreModule } from '../_lib';
import { ResponseFilter, ValidationPipe } from 'finfrac/core/shared';
import { AuthModule } from '../../src/auth';

describe('Sign Up (e2e)', () => {
  let x_signed_data;
  const time = Date.now();
  let userid;
  let tokenEmail;
  let tokenMobile;
  let createUser;
  let defaultUser;

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
    if (dbConnection) {
      await Promise.all([
        dbConnection.collection('auths').deleteMany({}),
        dbConnection.collection('users').deleteMany({}),
      ]);
      dbConnection.close();
    }
  });

  describe('/auth/sign-up (POST) signUp', () => {
    it('Should test creating with invalid payload', async () => {
      const response = await request(httpServer)
        .post('/auth/sign-up')
        .send({ email: signUpStub.email });
      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta).toHaveProperty('statusCode');
      expect(response.body.meta).toHaveProperty('error');
      expect(response.body.meta.statusCode).toBe(400);
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.error).toHaveProperty('code');
      expect(response.body.meta.error).toHaveProperty('message');
      expect(response.body.meta.error).toHaveProperty('messages');
      expect(response.body.meta.error.code).toBe(400);
      expect(response.body.meta.error.message).toBe(
        'Bad request / Validation error',
      );
      expect(response.body.meta.error.messages).toBeInstanceOf(Object);
    });
    // it('Should test creating a auth/user with the expected details(email and password)', async () => {
    //   const response = await request(httpServer).post('/auth/sign-up').send({
    //     email: signUpStub.email,
    //     password: signUpStub.password,
    //   });
    //   tokenEmail = response.body.meta.token;
    //   userid = response.body.data._id;
    //   expect(response.status).toBe(200);
    //   expect(response.body).toBeInstanceOf(Object);
    //   expect(response.body.meta).toBeInstanceOf(Object);
    //   expect(response.body.meta).toHaveProperty('token');
    //   expect(response.body.meta.statusCode).toBe(200);
    //   expect(response.body.meta.success).toBe(true);
    //   expect(response.body.data).toBeInstanceOf(Object);
    //   expect(response.body.data).toHaveProperty('verifications');
    //   expect(response.body.data).toHaveProperty('_id');
    // });
    // it('Should test creating a auth/user with the expected details(mobile and password)', async () => {
    //   const response = await request(httpServer).post('/auth/sign-up').send({
    //     mobile: signUpStub.mobile,
    //     password: signUpStub.password,
    //   });
    //   console.log('response.body.data ::: ', response.body);
    //   tokenMobile = response.body.meta.token;
    //   createUser = response.body.data;
    //   expect(response.status).toBe(200);
    //   expect(response.body).toBeInstanceOf(Object);
    //   expect(response.body.meta).toBeInstanceOf(Object);
    //   expect(response.body.meta).toHaveProperty('token');
    //   expect(response.body.meta.statusCode).toBe(200);
    //   expect(response.body.meta.success).toBe(true);
    //   expect(response.body.data).toBeInstanceOf(Object);
    //   expect(response.body.data).toHaveProperty('verifications');
    //   expect(response.body.data).toHaveProperty('_id');
    // });
    // it('Should test creating a auth/user that already exist', async () => {
    //   const response = await request(httpServer).post('/auth/sign-up').send({
    //     email: signUpStub.email,
    //     password: signUpStub.password,
    //   });
    //   expect(response.status).toBe(409);
    //   expect(response.body.meta.statusCode).toBe(409);
    //   expect(response.body).toBeInstanceOf(Object);
    //   expect(response.body.meta.error).toBeInstanceOf(Object);
    //   expect(response.body.meta.error.code).toBe(409);
    //   expect(response.body.meta.error.message).toBe(
    //     'User with credential already exist!',
    //   );
    // });
  });
});
