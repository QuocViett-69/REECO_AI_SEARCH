import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../database/supabase/supabase.module';
import { ProductsModule } from '../products/products.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [ProductsModule, SupabaseModule],
  controllers: [AdminController],
})
export class AdminModule {}
