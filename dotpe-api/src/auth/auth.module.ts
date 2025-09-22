import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TwilioModule } from '../twilio/twilio.module';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { TestController } from './test.controller';

@Module({
  imports: [
    ConfigModule,
    TwilioModule,
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get<string>('JWT_EXPIRES_IN') || '15m' },
      }),
    }),
  ],
  controllers: [AuthController, TestController],  // ⬅️ Add TestController here
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
