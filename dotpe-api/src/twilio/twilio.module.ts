import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import twilio, { Twilio } from 'twilio';

export const TWILIO_CLIENT = Symbol('TWILIO_CLIENT');
export type TwilioClient = Twilio;

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: TWILIO_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Twilio => {
        const accountSid = config.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = config.get<string>('TWILIO_AUTH_TOKEN');

        if (!accountSid || !authToken) {
          if (config.get<string>('NODE_ENV') !== 'production') {
            return twilio('ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'test_auth_token');
          }

          throw new Error(
            'Twilio credentials are missing. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in your environment.',
          );
        }

        return twilio(accountSid, authToken);
      },
    },
  ],
  exports: [TWILIO_CLIENT],
})
export class TwilioModule {}