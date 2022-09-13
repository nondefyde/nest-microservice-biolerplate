/* eslint-disable @typescript-eslint/no-empty-function */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { DatabaseService } from '../_lib/database/database.service';
import { TestCoreModule, verifyEmailStub, verifyMobileStub } from '../_lib';
import { ResponseFilter, ValidationPipe } from 'finfrac/core/shared';
import { AuthModule } from '../../src/auth';

describe('UsersController (e2e)', () => {
  let x_signed_data;
  const time = Date.now();
  let tokenEmail;
  let tokenMobile;

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

  describe('/auth/send-verification (POST) sendVerification', () => {
    it('Should test sendVerification with invalid authentication', async () => {
      const response = await request(httpServer)
        .post('/auth/send-verification')
        .set('Authorization', `Bearer hjvbkjbjlsbvonkwlnlk`)
        .send({ mobile: verifyMobileStub.mobile, type: 'mobile' });
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
    it('Should test sendVerification with mobile', async () => {
      const user = await request(httpServer)
        .post('/auth/sign-up')
        .send({
          mobile: {
            phoneNumber: verifyMobileStub.mobile.phoneNumber,
            isoCode: verifyMobileStub.mobile.isoCode,
          },
          password: verifyMobileStub.password,
        });
      tokenMobile = user.body.meta.token;
      const response = await request(httpServer)
        .post('/auth/send-verification')
        .set('Authorization', `Bearer ${tokenMobile}`)
        .send({ mobile: verifyMobileStub.mobile, type: 'mobile' });

      expect(response.status).toBe(200);
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body.meta.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('verifications');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.verifications).toHaveProperty('email');
      expect(response.body.data.verifications).toHaveProperty('mobile');
      expect(response.body.data.verifications.email).toBe(false);
      expect(response.body.data.verifications.mobile).toBe(false);
    });
    it('Should test sendVerification with email', async () => {
      const user = await request(httpServer).post('/auth/sign-up').send({
        email: 'dummyemail@gmail.com',
        password: verifyEmailStub.password,
      });

      tokenEmail = user.body.meta.token;
      const response = await request(httpServer)
        .post('/auth/send-verification')
        .set('Authorization', `Bearer ${tokenEmail}`)
        .send({ email: verifyEmailStub.email, type: 'email' });

      expect(response.status).toBe(200);
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.meta).toBeInstanceOf(Object);
      expect(response.body.meta.statusCode).toBe(200);
      expect(response.body.meta.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('verifications');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.verifications).toHaveProperty('email');
      expect(response.body.data.verifications).toHaveProperty('mobile');
      expect(response.body.data.verifications.email).toBe(false);
      expect(response.body.data.verifications.mobile).toBe(false);
    });
  });
});
