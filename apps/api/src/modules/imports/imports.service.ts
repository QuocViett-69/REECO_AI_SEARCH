import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

export interface ImportResponse {
  status: 'completed';
  report: unknown;
}

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);
  private isRunning = false;

  async run(): Promise<ImportResponse> {
    if (this.isRunning) {
      throw new ConflictException('A product import is already running');
    }
    if (!process.env.DATABASE_URL) {
      throw new ServiceUnavailableException(
        'DATABASE_URL is not configured for product imports',
      );
    }

    const scriptPath = this.findImportScript();
    this.isRunning = true;
    try {
      const output = await this.runScript(scriptPath);
      let report: unknown;
      try {
        report = JSON.parse(output);
      } catch {
        report = { output };
      }
      return { status: 'completed', report };
    } catch (error) {
      this.logger.error(
        error instanceof Error ? error.message : 'Unknown import failure',
      );
      throw new ServiceUnavailableException(
        'Product import failed; inspect the API server logs for details',
      );
    } finally {
      this.isRunning = false;
    }
  }

  private findImportScript(): string {
    const pathSegments = [
      'scripts',
      'supabase',
      'import-data-foundation.mjs',
    ];
    const candidates = [
      resolve(process.cwd(), ...pathSegments),
      resolve(process.cwd(), '..', '..', ...pathSegments),
    ];
    const scriptPath = candidates.find((candidate) => existsSync(candidate));
    if (!scriptPath) {
      throw new ServiceUnavailableException(
        'The product import script is not available in this deployment',
      );
    }
    return scriptPath;
  }

  private runScript(scriptPath: string): Promise<string> {
    const projectRoot = resolve(dirname(scriptPath), '..', '..');
    return new Promise((resolvePromise, rejectPromise) => {
      const child = spawn(process.execPath, [scriptPath], {
        cwd: projectRoot,
        env: process.env,
        shell: false,
        windowsHide: true,
      });
      let stdout = '';
      let stderr = '';
      child.stdout.setEncoding('utf8');
      child.stderr.setEncoding('utf8');
      child.stdout.on('data', (chunk: string) => {
        stdout += chunk;
      });
      child.stderr.on('data', (chunk: string) => {
        stderr += chunk;
      });
      child.on('error', rejectPromise);
      child.on('close', (code) => {
        if (code === 0) resolvePromise(stdout.trim());
        else rejectPromise(new Error(stderr.trim() || `Import exited ${code}`));
      });
    });
  }
}
