-api/src/auth/auth.service.spec.ts
+12
-0

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { TwilioModule } from '../twilio/twilio.module';

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.OTP_HASH_SECRET = 'test-secret';
    process.env.TWILIO_PHONE_NUMBER = '+10000000000';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TwilioModule,
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});