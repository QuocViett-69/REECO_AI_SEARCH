import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../database/supabase/supabase.module';
import { ProductsModule } from '../products/products.module';
import { AdminController, AdminOperationsController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [ProductsModule, SupabaseModule],
  controllers: [AdminController, AdminOperationsController],
  providers: [AdminService],
})
export class AdminModule {}
