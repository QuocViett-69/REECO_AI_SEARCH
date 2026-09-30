import { Module } from '@nestjs/common';
import { SupabaseModule } from './database/supabase/supabase.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmbeddingsModule } from './modules/embeddings/embeddings.module';
import { HealthModule } from './modules/health/health.module';
import { ImportsModule } from './modules/imports/imports.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    SupabaseModule,
    HealthModule,
    ProductsModule,
    AdminModule,
    ImportsModule,
    SearchModule,
    EmbeddingsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
