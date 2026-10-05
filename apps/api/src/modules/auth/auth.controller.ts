import { Controller, Post, Body, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginRequest, AuthSession } from '@reeco/shared';
import { LoginRequestSchema } from '@reeco/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(LoginRequestSchema)) credentials: LoginRequest,
  ): Promise<AuthSession> {
    return this.authService.login(credentials);
  }
}
