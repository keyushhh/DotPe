import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, randomInt } from 'node:crypto';
import { TWILIO_CLIENT } from '../twilio/twilio.module';
import type { TwilioClient } from '../twilio/twilio.module';
import Redis from 'ioredis';

type OtpRecord = {
  codeHash: string;
  salt: string;
  expiresAt: number;
  attempts: number;
};

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    // Twilio client injected via provider
    @Inject(TWILIO_CLIENT) private readonly twilio: TwilioClient,
  ) {
    // 👇 create Redis connection directly
    this.redis = new Redis(); // defaults to localhost:6379
  }

  /** Normalize phone number to E.164 (+91XXXXXXXXXX). */
  private normalizeToE164(value: string): string {
    if (!value) throw new BadRequestException('Phone/identifier is required');
    const trimmed = value.replace(/\s+/g, '');

    if (/^\+91\d{10}$/.test(trimmed)) return trimmed;
    if (/^[6-9]\d{9}$/.test(trimmed)) return `+91${trimmed}`;
    if (/^\+\d{10,15}$/.test(trimmed)) return trimmed;

    throw new BadRequestException('Invalid phone number');
  }

  /** Generate a cryptographically secure 6-digit OTP */
  private generateCode(): string {
    return randomInt(100000, 1000000).toString();
  }

  private getOtpSecret(): string {
    const secret = this.config.get<string>('OTP_HASH_SECRET');
    if (!secret) {
      throw new Error('OTP_HASH_SECRET is not configured. Add it to .env');
    }
    return secret;
  }

  private hashCode(code: string, salt: string): string {
    return createHmac('sha256', `${this.getOtpSecret()}:${salt}`)
      .update(code)
      .digest('hex');
  }

  async sendOtp(identifier: string) {
    const to = this.normalizeToE164(identifier);
    const key = `otp:${to}`;

    const now = Date.now();

    // cooldown check (30s)
    const lastSentAt = await this.redis.get(`${key}:lastSentAt`);
    if (lastSentAt && now - parseInt(lastSentAt, 10) < 30_000) {
      const wait = 30 - Math.ceil((now - parseInt(lastSentAt, 10)) / 1000);
      throw new BadRequestException(
        `Please wait ${wait}s before requesting again`,
      );
    }

    const code = this.generateCode();
    const salt = randomBytes(16).toString('hex');
    const codeHash = this.hashCode(code, salt);

    const record: OtpRecord = {
      codeHash,
      salt,
      expiresAt: now + 5 * 60_000, // 5 min
      attempts: 0,
    };

    // save OTP record in Redis (5 min TTL)
    await this.redis.set(key, JSON.stringify(record), 'PX', 5 * 60_000);
    await this.redis.set(`${key}:lastSentAt`, now.toString(), 'PX', 30_000);

    // send SMS
    await this.twilio.messages.create({
      body: `Your DotPe OTP is ${code}`,
      from: this.config.getOrThrow<string>('TWILIO_PHONE_NUMBER'),
      to,
    });

    return { success: true, message: 'OTP sent via SMS', to };
  }

  async verifyOtp(identifier: string, code: string) {
    const to = this.normalizeToE164(identifier);
    const key = `otp:${to}`;

    const data = await this.redis.get(key);
    if (!data) {
      throw new BadRequestException('No OTP requested or OTP expired');
    }

    const rec: OtpRecord = JSON.parse(data);

    if (Date.now() > rec.expiresAt) {
      await this.redis.del(key);
      throw new BadRequestException('OTP expired, request a new one');
    }

    rec.attempts += 1;

    const submittedHash = this.hashCode(code, rec.salt);
    if (rec.codeHash !== submittedHash) {
      if (rec.attempts >= 5) {
        await this.redis.del(key);
      } else {
        await this.redis.set(
          key,
          JSON.stringify(rec),
          'PX',
          rec.expiresAt - Date.now(),
        );
      }
      throw new BadRequestException('Invalid OTP');
    }

    // ✅ OTP valid → delete from Redis
    await this.redis.del(key);

    // ✅ Find or create user
    let user = await this.usersService.findByPhone(to);
    if (!user) {
      user = await this.usersService.create({ phone: to });
    }

    // ✅ Sign JWT token
    const payload = { sub: user.id, phone: user.phone };
    const token = await this.jwt.signAsync(payload);

    return { success: true, message: 'OTP verified', access_token: token };
  }
}
