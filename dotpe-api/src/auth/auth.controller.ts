import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('send-otp')
  send(@Body() dto: SendOtpDto) {
    const id = dto.identifier ?? dto.phone!;
    return this.auth.sendOtp(id);
  }

  @Post('verify-otp')
  verify(@Body() dto: VerifyOtpDto) {
    const id = dto.identifier ?? dto.phone!;
    return this.auth.verifyOtp(id, dto.code);
  }
}
