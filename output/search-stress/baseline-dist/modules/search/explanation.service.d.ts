import type { ProductSearchDocument, ProductSpecification, SearchResponse } from '@reeco/shared';
import type { TechnicalMatchResult } from './technical-match.service';
type Explanation = NonNullable<SearchResponse['results'][number]['explanation']>;
export declare class ExplanationService {
    private readonly logger;
    private readonly config;
    explainMany(query: string, items: {
        document: ProductSearchDocument;
        match?: TechnicalMatchResult;
        specifications?: ProductSpecification[];
    }[]): Promise<Explanation[]>;
    private isGroundedRewrite;
    explain(query: string, document: ProductSearchDocument, match?: TechnicalMatchResult, specifications?: ProductSpecification[]): Explanation;
}
export {};
