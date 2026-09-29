import type { HybridSearchCandidate } from './hybrid-search.service';
import type { TechnicalEvaluation, TechnicalMatchResult } from './technical-match.service';
export type TechnicalTemperatureState = TechnicalEvaluation | null;
export interface TechnicalRankingMetadata {
    exactIdentity: boolean;
    satisfiedConstraintCount: number;
    confirmedProtocolMatchCount: number;
    temperatureState: TechnicalTemperatureState;
    hardMismatch: boolean;
}
export interface TechnicalRankedCandidate {
    candidate: HybridSearchCandidate;
    originalHybridRank: number;
    technical: TechnicalRankingMetadata;
    matchedFeatures: string[];
}
export declare class TechnicalRankingService {
    rank(candidates: readonly HybridSearchCandidate[], matches: readonly TechnicalMatchResult[]): TechnicalRankedCandidate[];
    preserve(candidates: readonly HybridSearchCandidate[]): TechnicalRankedCandidate[];
    private toRankedCandidate;
    private compare;
    private temperatureState;
    private temperatureOrder;
    private matchedFeatures;
    private temperatureFeature;
}
