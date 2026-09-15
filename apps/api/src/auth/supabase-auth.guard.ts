import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { SupabaseService } from '../database/supabase/supabase.service';

interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user?: User;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private readonly supabase: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const header = Array.isArray(authorization)
      ? authorization[0]
      : authorization;
    const [scheme, token] = header?.split(' ') ?? [];
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('A Bearer access token is required');
    }

    if (!this.supabase.isConfigured) {
      throw new ServiceUnavailableException('Supabase Auth is not configured');
    }

    const user = await this.supabase.getUser(token);
    if (!user)
      throw new UnauthorizedException('The access token is invalid or expired');
    request.user = user;
    return true;
  }
}
