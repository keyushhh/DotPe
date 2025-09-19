import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TWILIO_CLIENT } from '../twilio/twilio.module';
import type { TwilioClient } from '../twilio/twilio.module';

type OtpRecord = {
  codeHash: string;
  salt: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
};

@Injectable()
export class AuthService {
  private store = new Map<string, OtpRecord>();

  constructor(
    @Inject(TWILIO_CLIENT) private readonly twilio: TwilioClient,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  /** Accepts +91XXXXXXXXXX or 10-digit Indian mobile and returns E.164 (+91XXXXXXXXXX). */
  private normalizeToE164(value: string): string {
    if (!value) throw new BadRequestException('Phone/identifier is required');

    const trimmed = value.replace(/\s+/g, '');

    // Already E.164 +91XXXXXXXXXX
    if (/^\+91\d{10}$/.test(trimmed)) return trimmed;

    // 10-digit Indian mobile -> prefix +91
    if (/^[6-9]\d{9}$/.test(trimmed)) return `+91${trimmed}`;

    // Fallback: generic E.164 (+XXXXXXXXXXX up to 15 digits)
    if (/^\+\d{10,15}$/.test(trimmed)) return trimmed;

    throw new BadRequestException('Invalid Indian phone number');
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getOtpSecret(): string {
    const secret = this.config.get<string>('OTP_HASH_SECRET');
    if (!secret) {
      throw new Error(
        'OTP_HASH_SECRET is not configured. Add it to your environment variables.',
      );
    }
    return secret;
  }

  private hashCode(code: string, salt: string): string {
    return createHmac('sha256', `${this.getOtpSecret()}:${salt}`)
      .update(code)
      .digest('hex');
  }

  /** We keep the param name as `identifier`, but we normalize it to a phone for SMS. */
  async sendOtp(identifier: string) {
    // Normalize once and use the normalized value for both Twilio and as the map key
    const to = this.normalizeToE164(identifier);
    const key = to;

    const now = Date.now();
    const existing = this.store.get(key);

    // 30s resend cooldown
    if (existing && now - existing.lastSentAt < 30_000) {
      const wait = 30 - Math.ceil((now - existing.lastSentAt) / 1000);
      throw new BadRequestException(
        `Please wait ${wait}s before requesting again`,
      );
    }

    const code = this.generateCode();
    const salt = randomBytes(16).toString('hex');
    const codeHash = this.hashCode(code, salt);

    // store only the hash (safer)
    this.store.set(key, {
      codeHash,
      salt,
      expiresAt: now + 5 * 60_000, // 5 minutes
      lastSentAt: now,
      attempts: 0,
    });

    // Send SMS via injected Twilio client
    await this.twilio.messages.create({
      body: `Your DotPe OTP is ${code}`,
      from: this.config.getOrThrow<string>('TWILIO_PHONE_NUMBER'),
      to, // normalized E.164
    });

    return { success: true, message: 'OTP sent via SMS', to };
  }

  async verifyOtp(identifier: string, code: string) {
    // Use the same normalization so the map key matches what we used in sendOtp
    const key = this.normalizeToE164(identifier);

    const rec = this.store.get(key);
    if (!rec) {
      throw new BadRequestException('No OTP requested for this identifier');
    }

    if (Date.now() > rec.expiresAt) {
      this.store.delete(key);
      throw new BadRequestException('OTP expired, request a new one');
    }

    rec.attempts += 1;

    const submittedHash = this.hashCode(code, rec.salt);
    if (rec.codeHash !== submittedHash) {
      if (rec.attempts >= 5) this.store.delete(key);
      throw new BadRequestException('Invalid OTP');
    }

    // ✅ OTP verified — clean up
    this.store.delete(key);

    // ✅ Create/find user + sign JWT
    const user = this.users.findOrCreateByPhone(key);
    const payload = { sub: user.id, phone: user.phone };
    const access_token = await this.jwt.signAsync(payload);

    return { success: true, message: 'OTP verified', access_token };
  }
}
