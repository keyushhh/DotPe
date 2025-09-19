import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/send-otp (POST) should return success', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ identifier: '+918787311620' }) // can also try phone: '8787311620'
      .expect(201);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message');
  });

  it('/auth/verify-otp (POST) should fail with wrong code', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ identifier: '+918787311620', code: '000000' })
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});
