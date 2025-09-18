import { Injectable, BadRequestException } from '@nestjs/common';
import twilio from 'twilio';

type OtpRecord = {
  code: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
};

@Injectable()
export class AuthService {
  private store = new Map<string, OtpRecord>();

  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(identifier: string) {
    const now = Date.now();
    const existing = this.store.get(identifier);

    // 30s resend cooldown
    if (existing && now - existing.lastSentAt < 30_000) {
      const wait = 30 - Math.ceil((now - existing.lastSentAt) / 1000);
      throw new BadRequestException(`Please wait ${wait}s before requesting again`);
    }

    const code = this.generateCode();
    this.store.set(identifier, {
      code,
      expiresAt: now + 5 * 60_000, // 5 minutes expiry
      lastSentAt: now,
      attempts: 0,
    });

    // ---- SEND SMS VIA TWILIO ----
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    await client.messages.create({
      body: `Your DotPe OTP is ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio trial number
      to: identifier, // must be your verified number on trial account
    });

    return { success: true, message: 'OTP sent via SMS', identifier };
  }

  async verifyOtp(identifier: string, code: string) {
    const rec = this.store.get(identifier);
    if (!rec) throw new BadRequestException('No OTP requested for this identifier');

    if (Date.now() > rec.expiresAt) {
      this.store.delete(identifier);
      throw new BadRequestException('OTP expired, request a new one');
    }

    rec.attempts += 1;
    if (rec.code !== code) {
      if (rec.attempts >= 5) this.store.delete(identifier);
      throw new BadRequestException('Invalid OTP');
    }

    this.store.delete(identifier);
    return { success: true, message: 'OTP verified' };
  }
}
