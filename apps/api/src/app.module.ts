import { Module } from '@nestjs/common';
import { SupabaseModule } from './database/supabase/supabase.module';
import { AdminModule } from './modules/admin/admin.module';
import { EmbeddingsModule } from './modules/embeddings/embeddings.module';
import { ExplanationModule } from './modules/explanation/explanation.module';
import { HealthModule } from './modules/health/health.module';
import { ImportsModule } from './modules/imports/imports.module';
import { ProductsModule } from './modules/products/products.module';
import { RerankerModule } from './modules/reranker/reranker.module';
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
    RerankerModule,
    ExplanationModule,
  ],
})
export class AppModule {}
