import { type SearchRequest, type SearchResponse } from '@reeco/shared';
import { ProductsService } from '../products/products.service';
import { ExplanationService } from './explanation.service';
import { HybridSearchService } from './hybrid-search.service';
import { TechnicalMatchService } from './technical-match.service';
import { RerankerService } from './reranker.service';
import { TechnicalQueryParserService } from './technical-query-parser.service';
import { TechnicalRankingService } from './technical-ranking.service';
export declare class SearchService {
    private readonly hybridSearch;
    private readonly productsService;
    private readonly technicalQueryParser;
    private readonly technicalMatch;
    private readonly technicalRanking;
    private readonly reranker;
    private readonly explanation;
    private readonly logger;
    private readonly configuredRetrievalLimit;
    constructor(hybridSearch: HybridSearchService, productsService: ProductsService, technicalQueryParser: TechnicalQueryParserService, technicalMatch: TechnicalMatchService, technicalRanking: TechnicalRankingService, reranker: RerankerService, explanation: ExplanationService);
    search(request: SearchRequest): Promise<SearchResponse>;
    private searchOnce;
    private withExplanations;
    private applyTechnicalPolicy;
    private hasApplicableTechnicalSignal;
    private mapMode;
    private mapScores;
}
