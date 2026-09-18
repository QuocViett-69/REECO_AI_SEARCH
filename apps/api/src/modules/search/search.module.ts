import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../database/supabase/supabase.module';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { ProductsModule } from '../products/products.module';
import { HybridSearchService } from './hybrid-search.service';
import { KeywordSearchService } from './keyword-search.service';
import { SearchScoreService } from './search-score.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SemanticSearchService } from './semantic-search.service';
import { TechnicalMatchService } from './technical-match.service';
import { TechnicalQueryParserService } from './technical-query-parser.service';
import { TechnicalRankingService } from './technical-ranking.service';

@Module({
  imports: [SupabaseModule, EmbeddingsModule, ProductsModule],
  controllers: [SearchController],
  providers: [
    SearchService,
    KeywordSearchService,
    SemanticSearchService,
    HybridSearchService,
    SearchScoreService,
    TechnicalQueryParserService,
    TechnicalMatchService,
    TechnicalRankingService,
  ],
})
export class SearchModule {}
