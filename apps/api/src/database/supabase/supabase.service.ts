import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  createClient,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  readonly url = process.env.SUPABASE_URL;
  readonly serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  private readonly client: SupabaseClient | null;

  constructor() {
    this.client =
      this.url && this.serviceRoleKey
        ? createClient(this.url, this.serviceRoleKey, {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
              detectSessionInUrl: false,
            },
          })
        : null;
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'Supabase is not configured for the API server',
      );
    }
    return this.client;
  }

  async getUser(accessToken: string): Promise<User | null> {
    if (!this.client) return null;
    const { data, error } = await this.client.auth.getUser(accessToken);
    return error ? null : data.user;
  }
}
