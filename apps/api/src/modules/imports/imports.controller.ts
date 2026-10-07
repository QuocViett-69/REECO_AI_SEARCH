import { Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { ImportsService, type ImportResponse } from './imports.service';

@Controller('admin/import')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post()
  run(): Promise<ImportResponse> {
    return this.importsService.run();
  }
}
