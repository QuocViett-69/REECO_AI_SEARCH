import { ForbiddenException, Injectable } from '@nestjs/common';

export interface ImportResponse {
  status: 'completed';
  report: unknown;
}

@Injectable()
export class ImportsService {
  async run(): Promise<ImportResponse> {
    throw new ForbiddenException('Demo catalog is read-only; import and backfill through the offline data pipeline');
  }
}
