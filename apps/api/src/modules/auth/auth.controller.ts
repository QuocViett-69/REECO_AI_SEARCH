import { Controller, Post, Body, HttpCode, HttpStatus, Get, Patch, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { LoginRequest, RegisterRequest, RefreshRequest, UpdateMeRequest, AuthSession, Me } from '@reeco/shared';
import { LoginRequestSchema, RegisterRequestSchema, RefreshRequestSchema, UpdateMeRequestSchema } from '@reeco/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CurrentUser } from '../../auth/current-user.decorator';
import { User } from '@supabase/supabase-js';

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

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(RegisterRequestSchema)) data: RegisterRequest,
  ): Promise<AuthSession> {
    return this.authService.register(data);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body(new ZodValidationPipe(RefreshRequestSchema)) data: RefreshRequest,
  ): Promise<AuthSession> {
    return this.authService.refresh(data);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  async getMe(@CurrentUser() user: User): Promise<Me> {
    return this.authService.getMe(user);
  }

  @Patch('me')
  @UseGuards(SupabaseAuthGuard)
  async updateMe(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(UpdateMeRequestSchema)) data: UpdateMeRequest,
  ): Promise<Me> {
    return this.authService.updateMe(user, data);
  }
}
