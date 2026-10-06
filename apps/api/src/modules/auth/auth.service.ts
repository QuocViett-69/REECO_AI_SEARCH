import { Injectable, UnauthorizedException, ServiceUnavailableException, ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase/supabase.service';
import type { LoginRequest, RegisterRequest, RefreshRequest, UpdateMeRequest, AuthSession, Me } from '@reeco/shared';
import { User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  private mapUserToMe(user: User): Me {
    return {
      id: user.id,
      email: user.email ?? '',
      role: (user.app_metadata?.role as string) || 'customer',
      full_name: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || '',
      phone: (user.user_metadata?.phone as string) || null,
      company: (user.user_metadata?.company as string) || null,
    };
  }

  async login(credentials: LoginRequest): Promise<AuthSession> {
    const client = this.supabase.getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: this.mapUserToMe(data.user),
    };
  }

  async register(data: RegisterRequest): Promise<AuthSession> {
    const client = this.supabase.getClient();
    const { data: userData, error } = await client.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      app_metadata: { role: 'customer' },
      user_metadata: {
        full_name: data.full_name,
        phone: data.phone || null,
        company: data.company || null,
      },
    });

    if (error) {
      if (error.status === 422 || error.message.includes('already exists')) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException(error.message);
    }

    return this.login({ email: data.email, password: data.password });
  }

  async refresh(data: RefreshRequest): Promise<AuthSession> {
    const client = this.supabase.getClient();
    const { data: refreshData, error } = await client.auth.refreshSession({
      refresh_token: data.refresh_token,
    });

    if (error || !refreshData.session || !refreshData.user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return {
      access_token: refreshData.session.access_token,
      refresh_token: refreshData.session.refresh_token,
      expires_at: refreshData.session.expires_at,
      user: this.mapUserToMe(refreshData.user),
    };
  }

  async getMe(user: User): Promise<Me> {
    return this.mapUserToMe(user);
  }

  async updateMe(user: User, data: UpdateMeRequest): Promise<Me> {
    const client = this.supabase.getClient();

    // Check if body contains restricted fields using strict validation would be done in pipe, but let's just use what's given.
    const { data: updatedData, error } = await client.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        ...(data.full_name !== undefined && { full_name: data.full_name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.company !== undefined && { company: data.company }),
      },
    });

    if (error || !updatedData.user) {
      throw new InternalServerErrorException(error?.message || 'Update failed');
    }

    return this.mapUserToMe(updatedData.user);
  }
}
