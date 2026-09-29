import { type SupabaseClient, type User } from '@supabase/supabase-js';
export declare class SupabaseService {
    readonly url: string | undefined;
    readonly serviceRoleKey: string | undefined;
    private readonly client;
    constructor();
    get isConfigured(): boolean;
    getClient(): SupabaseClient;
    getUser(accessToken: string): Promise<User | null>;
}
