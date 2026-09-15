import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../database/supabase/supabase.module';
import { ProductsModule } from '../products/products.module';
import { HybridSearchService } from './hybrid-search.service';
import { KeywordSearchService } from './keyword-search.service';
import { SearchScoreService } from './search-score.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SemanticSearchService } from './semantic-search.service';

@Module({
  imports: [SupabaseModule, ProductsModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    KeywordSearchService,
    SemanticSearchService,
    HybridSearchService,
    SearchScoreService,
  ],
})
export class SearchModule {}
