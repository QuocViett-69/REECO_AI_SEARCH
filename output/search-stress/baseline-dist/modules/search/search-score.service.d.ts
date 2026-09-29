export declare const MAX_RRF_K = 1000;
export interface HybridComparableCandidate {
    productId: string;
    keywordRank: number | null;
    semanticRank: number | null;
    rrfScore: number;
    matchedBy: {
        keyword: boolean;
        semantic: boolean;
    };
}
export declare class SearchScoreService {
    private readonly rrfK;
    getRrfK(): number;
    calculateRrfContribution(rank: number, k?: number): number;
    calculateRrfScore(keywordRank: number | null, semanticRank: number | null, k?: number): number;
    compareHybridCandidates(left: HybridComparableCandidate, right: HybridComparableCandidate): number;
    private compareNullableRanks;
    private validateRank;
    private validateK;
}
