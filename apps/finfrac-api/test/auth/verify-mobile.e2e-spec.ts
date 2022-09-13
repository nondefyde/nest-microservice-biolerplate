/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { DatabaseService } from '../_lib/database/database.service';
import { TestCoreModule, signUpStub, verifyMobileStub } from '../_lib';
import { ResponseFilter, ValidationPipe } from 'finfrac/core/shared';
import { AuthModule } from '../../src/auth';

describe('UsersController (e2e)', () => {
  let x_signed_data;
  const time = Date.now();
  let userid;
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
  });
  afterAll(async () => {
    await Promise.all([
      dbConnection.collection('auths').drop(),
      dbConnection.collection('users').drop(),
    ]);
  });
  describe('/auth/verify-mobile (POST) verifyMobile', () => {
    it('Should test verifyMobile with invalid authentication', async () => {
      const response = await request(httpServer)
        .post('/auth/verify-mobile')
        .set('Authorization', `Bearer hjvbkjbjlsbvonkwlnlk`)
        .send({ ...verifyMobileStub, verificationCode: '1111' });
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
    it('Should test login with invalid verification code', async () => {
      const user = await request(httpServer)
        .post('/auth/sign-up')
        .send({
          mobile: {
            phoneNumber: verifyMobileStub.mobile.phoneNumber,
            isoCode: verifyMobileStub.mobile.isoCode,
          },
          password: 'loremipsum',
        });
      tokenMobile = user.body.meta.token;

      const res = await request(httpServer)
        .post('/auth/send-verification')
        .set('Authorization', `Bearer ${tokenMobile}`)
        .send({ mobile: verifyMobileStub.mobile, type: 'mobile' });

      const response = await request(httpServer)
        .post('/auth/verify-mobile')
        .set('Authorization', `Bearer ${tokenMobile}`)
        .send({
          mobile: {
            phoneNumber: verifyMobileStub.mobile.phoneNumber,
            isoCode: verifyMobileStub.mobile.isoCode,
          },
          verificationCode: '2222',
        });

      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta).toHaveProperty('statusCode');
      expect(response.body.meta).toHaveProperty('error');
      expect(response.body.meta.statusCode).toBe(401);
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.error).toHaveProperty('code');
      expect(response.body.meta.error).toHaveProperty('message');
      expect(response.body.meta.error.code).toBe(401);
      expect(response.body.meta.error.message).toBe(
        'Invalid verification code',
      );
    });
    it('Should test login with valid request data', async () => {
      const response = await request(httpServer)
        .post('/auth/verify-mobile')
        .set('Authorization', `Bearer ${tokenMobile}`)
        .send(verifyMobileStub);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body.meta.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('verifications');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.verifications).toBeInstanceOf(Object);
      expect(response.body.data.verifications).toHaveProperty('email');
      expect(response.body.data.verifications).toHaveProperty('mobile');
      expect(response.body.data.verifications.mobile).toBe(true);
    });
    it('Should test already verified data', async () => {
      const response = await request(httpServer)
        .post('/auth/verify-mobile')
        .set('Authorization', `Bearer ${tokenMobile}`)
        .send(verifyMobileStub);
      expect(response.status).toBe(401);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta).toHaveProperty('statusCode');
      expect(response.body.meta).toHaveProperty('error');
      expect(response.body.meta.statusCode).toBe(401);
      expect(response.body.meta.error).toBeInstanceOf(Object);
      expect(response.body.meta.error).toHaveProperty('code');
      expect(response.body.meta.error).toHaveProperty('message');
      expect(response.body.meta.error.code).toBe(401);
      expect(response.body.meta.error.message).toBe('data already verified');
    });
  });
});
