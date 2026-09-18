import { Injectable } from '@nestjs/common';
import { configuration } from '../../config/configuration';

export const MAX_RRF_K = 1000;

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

@Injectable()
export class SearchScoreService {
  private readonly rrfK = this.validateK(configuration().search.rrfK);

  getRrfK(): number {
    return this.rrfK;
  }

  calculateRrfContribution(rank: number, k = this.rrfK): number {
    this.validateRank(rank);
    this.validateK(k);
    return 1 / (k + rank);
  }

  calculateRrfScore(
    keywordRank: number | null,
    semanticRank: number | null,
    k = this.rrfK,
  ): number {
    this.validateK(k);
    return (
      (keywordRank === null
        ? 0
        : this.calculateRrfContribution(keywordRank, k)) +
      (semanticRank === null
        ? 0
        : this.calculateRrfContribution(semanticRank, k))
    );
  }

  compareHybridCandidates(
    left: HybridComparableCandidate,
    right: HybridComparableCandidate,
  ): number {
    const scoreOrder = right.rrfScore - left.rrfScore;
    if (scoreOrder !== 0) return scoreOrder;

    const leftBoth = left.matchedBy.keyword && left.matchedBy.semantic;
    const rightBoth = right.matchedBy.keyword && right.matchedBy.semantic;
    if (leftBoth !== rightBoth) return leftBoth ? -1 : 1;

    const keywordOrder = this.compareNullableRanks(
      left.keywordRank,
      right.keywordRank,
    );
    if (keywordOrder !== 0) return keywordOrder;

    const semanticOrder = this.compareNullableRanks(
      left.semanticRank,
      right.semanticRank,
    );
    if (semanticOrder !== 0) return semanticOrder;

    if (left.productId === right.productId) return 0;
    return left.productId < right.productId ? -1 : 1;
  }

  private compareNullableRanks(
    left: number | null,
    right: number | null,
  ): number {
    if (left === null && right === null) return 0;
    if (left === null) return 1;
    if (right === null) return -1;
    return left - right;
  }

  private validateRank(rank: number): void {
    if (!Number.isSafeInteger(rank) || rank <= 0) {
      throw new Error('RRF rank must be a positive integer');
    }
  }

  private validateK(k: number): number {
    if (!Number.isSafeInteger(k) || k <= 0 || k > MAX_RRF_K) {
      throw new Error(`RRF K must be an integer between 1 and ${MAX_RRF_K}`);
    }
    return k;
  }
}
