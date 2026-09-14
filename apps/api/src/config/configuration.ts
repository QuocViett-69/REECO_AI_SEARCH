export interface AppConfiguration {
  nodeEnv: string;
  port: number;
  supabase: {
    url?: string;
    serviceRoleKey?: string;
  };
}

export function configuration(): AppConfiguration {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
    supabase: {
      url: process.env.SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  };
}
