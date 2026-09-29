import type { ProductSpecification } from '@reeco/shared';
import { ProductsService } from '../products/products.service';
import { CELSIUS_UNIT } from './technical-query.constants';
import type { ParsedTechnicalProtocol, ParsedTechnicalQuery, TemperatureConstraint } from './technical-query-parser.service';
export type TechnicalEvaluation = 'MATCH' | 'MISMATCH' | 'UNKNOWN';
export interface IdentityMatchEvidence {
    source: 'products';
    field: 'product_id' | 'model';
    value: string;
}
export interface ProtocolMatchEvidence {
    source: 'product_document';
    canonicalProtocol: string;
    relation: 'supported' | 'unsupported';
}
export interface ProtocolMatchEvaluation {
    queryProtocol: ParsedTechnicalProtocol;
    result: TechnicalEvaluation;
    evidence: ProtocolMatchEvidence[];
}
export interface TemperatureMatchEvidence {
    source: 'normalized_spec';
    canonicalKey: string;
    candidateRange: {
        minCelsius: number;
        maxCelsius: number;
        unit: typeof CELSIUS_UNIT;
    } | null;
    result: TechnicalEvaluation;
    rawRef: ProductSpecification['raw_ref'];
}
export interface TemperatureMatchEvaluation {
    constraint: TemperatureConstraint;
    result: TechnicalEvaluation;
    evidence: TemperatureMatchEvidence[];
}
export interface TechnicalMatchResult {
    productId: string;
    identityMatch: 'exact' | 'none';
    identityEvidence: IdentityMatchEvidence[];
    protocolMatches: ProtocolMatchEvaluation[];
    temperatureMatches: TemperatureMatchEvaluation[];
    hardMismatch: boolean;
}
export declare class TechnicalMatchService {
    private readonly productsService;
    constructor(productsService: ProductsService);
    evaluate(parsedQuery: ParsedTechnicalQuery, candidateProductIds: string[]): Promise<TechnicalMatchResult[]>;
    private identityEvidence;
    private evaluateProtocol;
    private protocolSatisfies;
    private evaluateTemperature;
    private evaluateTemperatureSpecification;
}
