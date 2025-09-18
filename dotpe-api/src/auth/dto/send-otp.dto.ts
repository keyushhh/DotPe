import { IsEmail, IsOptional, IsPhoneNumber, ValidateIf } from 'class-validator';

export class SendOtpDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @ValidateIf(o => !o.email)
  @IsPhoneNumber('IN', { message: 'Invalid Indian phone number' })
  phone?: string;
}
