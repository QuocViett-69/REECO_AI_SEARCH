import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../database/supabase/supabase.module';
import { ImportsController } from './imports.controller';
import { ImportsService } from './imports.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
