import type { ProductSearchDocument } from '@reeco/shared';
import { ProductsService } from '../products/products.service';
import type { ParsedTechnicalQuery } from './technical-query-parser.service';
import type { TechnicalRankedCandidate } from './technical-ranking.service';
export declare function serializeRerankerCandidate(document: ProductSearchDocument, parsed: ParsedTechnicalQuery, matchedFeatures: string[]): string;
export declare class RerankerService {
    private readonly productsService;
    private readonly logger;
    private readonly config;
    constructor(productsService: ProductsService);
    rerank(query: string, parsed: ParsedTechnicalQuery, baseline: TechnicalRankedCandidate[]): Promise<TechnicalRankedCandidate[]>;
    private candidates;
    private offlineMatchedFeatures;
    private request;
    private validate;
    private failureReason;
    private logTelemetry;
}
