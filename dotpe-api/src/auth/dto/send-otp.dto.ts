import { IsOptional, IsString, ValidateIf, Matches } from 'class-validator';

export class SendOtpDto {
  // Use identifier if phone is absent
  @ValidateIf(o => !o.phone)
  @IsString({ message: 'identifier must be a string' })
  @IsOptional()
  identifier?: string;

  // Use phone if identifier is absent
  @ValidateIf(o => !o.identifier)
  @IsString()
  @Matches(/^\+91\d{10}$|^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' })
  @IsOptional()
  phone?: string;
}
