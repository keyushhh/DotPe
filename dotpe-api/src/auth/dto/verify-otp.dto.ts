import { IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  identifier: string;

  @IsString()
  @Length(6, 6)
  code: string;
}

