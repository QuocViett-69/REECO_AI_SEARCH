import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  createClient,
  type SupabaseClient,
  type User,
} from '@supabase/supabase-js';
import { configuration } from '../../config/configuration';

@Injectable()
export class SupabaseService {
  private readonly config = configuration().supabase;
  readonly url = this.config.url;
  readonly serviceRoleKey = this.config.serviceRoleKey;
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
