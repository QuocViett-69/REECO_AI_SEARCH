import { Injectable } from '@nestjs/common';

@Injectable()
export class SupabaseService {
  readonly url = process.env.SUPABASE_URL;
  readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
}
