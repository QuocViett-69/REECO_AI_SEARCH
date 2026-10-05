import { Injectable, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase/supabase.service';
import type { LoginRequest, AuthSession } from '@reeco/shared';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  async login(credentials: LoginRequest): Promise<AuthSession> {
    const client = this.supabase.getClient();
    if (!client) {
      throw new ServiceUnavailableException('Supabase is not configured');
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email ?? '',
        name: data.user.user_metadata?.name || data.user.app_metadata?.name || '',
        role: data.user.app_metadata?.role as string | undefined,
      },
    };
  }
}
