import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  for (const envPath of [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), 'apps', 'api', '.env'),
  ]) {
    if (existsSync(envPath)) {
      process.loadEnvFile(envPath);
      console.log('Loaded env from', envPath, 'SUPABASE_URL:', process.env.SUPABASE_URL);
      break;
    }
  }

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  if (process.env.LOCAL_STAGING_READ_ONLY === 'true') {
    app.use('/api/v1/admin', (request: Request, response: Response, next: NextFunction) => {
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return next();
      return response.status(403).json({ message: 'Local staging is read-only' });
    });
  }
  app.enableCors({
    origin: [
      process.env.CLIENT_APP_URL ?? 'http://localhost:5173',
      process.env.ADMIN_APP_URL ?? 'http://localhost:5174',
    ].filter(Boolean),
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, process.env.HOST ?? '0.0.0.0');
}

void bootstrap();
