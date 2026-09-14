import { Module } from '@nestjs/common';
import { HybridSearchService } from './hybrid-search.service';
import { KeywordSearchService } from './keyword-search.service';
import { SearchScoreService } from './search-score.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SemanticSearchService } from './semantic-search.service';

@Module({
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
