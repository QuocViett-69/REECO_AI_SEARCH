import { Injectable } from '@nestjs/common';
import type { HybridSearchCandidate } from './hybrid-search.service';
import type {
  TechnicalEvaluation,
  TechnicalMatchResult,
  TemperatureMatchEvaluation,
} from './technical-match.service';

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

@Injectable()
export class TechnicalRankingService {
  rank(
    candidates: readonly HybridSearchCandidate[],
    matches: readonly TechnicalMatchResult[],
  ): TechnicalRankedCandidate[] {
    const matchesById = new Map(
      matches.map((match) => [match.productId, match]),
    );
    return candidates
      .map((candidate, index) =>
        this.toRankedCandidate(
          candidate,
          index + 1,
          matchesById.get(candidate.productId),
        ),
      )
      .filter((ranked) => !ranked.technical.hardMismatch)
      .sort((left, right) => this.compare(left, right));
  }

  preserve(
    candidates: readonly HybridSearchCandidate[],
  ): TechnicalRankedCandidate[] {
    return candidates.map((candidate, index) => ({
      candidate,
      originalHybridRank: index + 1,
      technical: {
        exactIdentity: false,
        satisfiedConstraintCount: 0,
        confirmedProtocolMatchCount: 0,
        temperatureState: null,
        hardMismatch: false,
      },
      matchedFeatures: [],
    }));
  }

  private toRankedCandidate(
    candidate: HybridSearchCandidate,
    originalHybridRank: number,
    match: TechnicalMatchResult | undefined,
  ): TechnicalRankedCandidate {
    if (!match) {
      return {
        candidate,
        originalHybridRank,
        technical: {
          exactIdentity: false,
          satisfiedConstraintCount: 0,
          confirmedProtocolMatchCount: 0,
          temperatureState: null,
          hardMismatch: false,
        },
        matchedFeatures: [],
      };
    }

    const confirmedProtocolMatchCount = match.protocolMatches.filter(
      (protocol) => protocol.result === 'MATCH',
    ).length;
    const confirmedTemperatureMatchCount = match.temperatureMatches.filter(
      (temperature) => temperature.result === 'MATCH',
    ).length;

    return {
      candidate,
      originalHybridRank,
      technical: {
        exactIdentity: match.identityMatch === 'exact',
        satisfiedConstraintCount:
          confirmedProtocolMatchCount + confirmedTemperatureMatchCount,
        confirmedProtocolMatchCount,
        temperatureState: this.temperatureState(match.temperatureMatches),
        hardMismatch: match.hardMismatch,
      },
      matchedFeatures: this.matchedFeatures(match),
    };
  }

  private compare(
    left: TechnicalRankedCandidate,
    right: TechnicalRankedCandidate,
  ): number {
    if (left.technical.exactIdentity !== right.technical.exactIdentity) {
      return left.technical.exactIdentity ? -1 : 1;
    }

    const satisfiedOrder =
      right.technical.satisfiedConstraintCount -
      left.technical.satisfiedConstraintCount;
    if (satisfiedOrder !== 0) return satisfiedOrder;

    const protocolOrder =
      right.technical.confirmedProtocolMatchCount -
      left.technical.confirmedProtocolMatchCount;
    if (protocolOrder !== 0) return protocolOrder;

    const temperatureOrder =
      this.temperatureOrder(left.technical.temperatureState) -
      this.temperatureOrder(right.technical.temperatureState);
    if (temperatureOrder !== 0) return temperatureOrder;

    const originalOrder = left.originalHybridRank - right.originalHybridRank;
    if (originalOrder !== 0) return originalOrder;

    return left.candidate.productId.localeCompare(right.candidate.productId);
  }

  private temperatureState(
    matches: readonly TemperatureMatchEvaluation[],
  ): TechnicalTemperatureState {
    if (matches.length === 0) return null;
    if (matches.some((match) => match.result === 'MISMATCH')) {
      return 'MISMATCH';
    }
    if (matches.some((match) => match.result === 'MATCH')) return 'MATCH';
    return 'UNKNOWN';
  }

  private temperatureOrder(state: TechnicalTemperatureState): number {
    if (state === 'MATCH') return 0;
    if (state === 'UNKNOWN') return 1;
    if (state === 'MISMATCH') return 2;
    return 3;
  }

  private matchedFeatures(match: TechnicalMatchResult): string[] {
    const features = new Set<string>();
    for (const evidence of match.identityEvidence) {
      features.add(`identity:${evidence.field}:${evidence.value}`);
    }
    for (const protocol of match.protocolMatches) {
      if (protocol.result !== 'MATCH') continue;
      for (const evidence of protocol.evidence) {
        if (evidence.relation === 'supported') {
          features.add(`protocol:${evidence.canonicalProtocol}`);
        }
      }
    }
    for (const temperature of match.temperatureMatches) {
      if (
        temperature.result !== 'MATCH' ||
        !temperature.evidence.some((evidence) => evidence.result === 'MATCH')
      ) {
        continue;
      }
      features.add(this.temperatureFeature(temperature));
    }
    return [...features];
  }

  private temperatureFeature(match: TemperatureMatchEvaluation): string {
    const constraint = match.constraint;
    const prefix = `${constraint.intent}-temperature`;
    if (constraint.kind === 'range') {
      return `${prefix}:${constraint.minCelsius}..${constraint.maxCelsius}${constraint.unit}`;
    }
    if (constraint.kind === 'upper_bound') {
      return `${prefix}:up-to-${constraint.valueCelsius}${constraint.unit}`;
    }
    return `${prefix}:${constraint.valueCelsius}${constraint.unit}`;
  }
}
