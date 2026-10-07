import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';

/**
 * Admin-only routes. Runs after SupabaseAuthGuard, which attaches the verified user;
 * the role lives in Supabase `app_metadata`, which only the service role can set.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: User }>();
    if (!request.user) {
      throw new UnauthorizedException('A Bearer access token is required');
    }
    if (request.user.app_metadata?.role !== 'admin') {
      throw new ForbiddenException(
        'Chỉ quản trị viên (Admin) mới có quyền truy cập',
      );
    }
    return true;
  }
}
