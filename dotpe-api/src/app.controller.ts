import { UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

@UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return { ok: true, user: req.user };
  }
}