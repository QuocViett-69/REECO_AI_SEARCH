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

  /**
   * A throwaway client for sign-in and token refresh. Those calls store the user's session
   * on the client they run on; on the shared service-role client every later query would
   * then run as that customer and hit row-level security (e.g. product_prices at checkout).
   */
  createSessionClient(): SupabaseClient {
    if (!this.url || !this.serviceRoleKey) {
      throw new ServiceUnavailableException(
        'Supabase is not configured for the API server',
      );
    }
    return createClient(this.url, this.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  async getUser(accessToken: string): Promise<User | null> {
    if (!this.client) return null;
    const { data, error } = await this.client.auth.getUser(accessToken);
    return error ? null : data.user;
  }
}
