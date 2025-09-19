import { IsOptional, IsString, ValidateIf, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ValidateIf(o => !o.phone)
  @IsString()
  @IsOptional()
  identifier?: string;

  @ValidateIf(o => !o.identifier)
  @IsString()
  @Matches(/^\+91\d{10}$|^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
  @IsOptional()
  phone?: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}
