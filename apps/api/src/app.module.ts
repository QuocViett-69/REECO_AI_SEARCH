import { Module } from '@nestjs/common';
import { SupabaseModule } from './database/supabase/supabase.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmbeddingsModule } from './modules/embeddings/embeddings.module';
import { HealthModule } from './modules/health/health.module';
import { ImportsModule } from './modules/imports/imports.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    SupabaseModule,
    HealthModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    ImportsModule,
    SearchModule,
    EmbeddingsModule,
  ],
})
export class AppModule {}
