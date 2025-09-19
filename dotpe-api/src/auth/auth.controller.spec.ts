import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';

describe('AuthController', () => {
  let controller: AuthController;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.OTP_HASH_SECRET = 'test-secret';
    process.env.TWILIO_PHONE_NUMBER = '+10000000000';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }), AuthModule],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});