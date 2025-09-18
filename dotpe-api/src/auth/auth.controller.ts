import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth/otp')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // Limit: 3 requests in 60s
  @Throttle({ default: { limit: 3, ttl: 60 } })
  @Post('send')
  async send(@Body() dto: SendOtpDto) {
    const identifier = dto.email?.toLowerCase().trim() ?? dto.phone!.trim();
    return this.auth.sendOtp(identifier);
  }

  // Limit: 10 requests in 60s
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Post('verify')
  async verify(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.identifier.trim(), dto.code.trim());
  }
}
