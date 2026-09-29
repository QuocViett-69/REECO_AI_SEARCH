"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalRankingService = void 0;
const common_1 = require("@nestjs/common");
let TechnicalRankingService = class TechnicalRankingService {
    rank(candidates, matches) {
        const matchesById = new Map(matches.map((match) => [match.productId, match]));
        return candidates
            .map((candidate, index) => this.toRankedCandidate(candidate, index + 1, matchesById.get(candidate.productId)))
            .filter((ranked) => !ranked.technical.hardMismatch)
            .sort((left, right) => this.compare(left, right));
    }
    preserve(candidates) {
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
    toRankedCandidate(candidate, originalHybridRank, match) {
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
        const confirmedProtocolMatchCount = match.protocolMatches.filter((protocol) => protocol.result === 'MATCH').length;
        const confirmedTemperatureMatchCount = match.temperatureMatches.filter((temperature) => temperature.result === 'MATCH').length;
        return {
            candidate,
            originalHybridRank,
            technical: {
                exactIdentity: match.identityMatch === 'exact',
                satisfiedConstraintCount: confirmedProtocolMatchCount + confirmedTemperatureMatchCount,
                confirmedProtocolMatchCount,
                temperatureState: this.temperatureState(match.temperatureMatches),
                hardMismatch: match.hardMismatch,
            },
            matchedFeatures: this.matchedFeatures(match),
        };
    }
    compare(left, right) {
        if (left.technical.exactIdentity !== right.technical.exactIdentity) {
            return left.technical.exactIdentity ? -1 : 1;
        }
        const satisfiedOrder = right.technical.satisfiedConstraintCount -
            left.technical.satisfiedConstraintCount;
        if (satisfiedOrder !== 0)
            return satisfiedOrder;
        const protocolOrder = right.technical.confirmedProtocolMatchCount -
            left.technical.confirmedProtocolMatchCount;
        if (protocolOrder !== 0)
            return protocolOrder;
        const temperatureOrder = this.temperatureOrder(left.technical.temperatureState) -
            this.temperatureOrder(right.technical.temperatureState);
        if (temperatureOrder !== 0)
            return temperatureOrder;
        const originalOrder = left.originalHybridRank - right.originalHybridRank;
        if (originalOrder !== 0)
            return originalOrder;
        return left.candidate.productId.localeCompare(right.candidate.productId);
    }
    temperatureState(matches) {
        if (matches.length === 0)
            return null;
        if (matches.some((match) => match.result === 'MISMATCH')) {
            return 'MISMATCH';
        }
        if (matches.some((match) => match.result === 'MATCH'))
            return 'MATCH';
        return 'UNKNOWN';
    }
    temperatureOrder(state) {
        if (state === 'MATCH')
            return 0;
        if (state === 'UNKNOWN')
            return 1;
        if (state === 'MISMATCH')
            return 2;
        return 3;
    }
    matchedFeatures(match) {
        const features = new Set();
        for (const evidence of match.identityEvidence) {
            features.add(`identity:${evidence.field}:${evidence.value}`);
        }
        for (const protocol of match.protocolMatches) {
            if (protocol.result !== 'MATCH')
                continue;
            for (const evidence of protocol.evidence) {
                if (evidence.relation === 'supported') {
                    features.add(`protocol:${evidence.canonicalProtocol}`);
                }
            }
        }
        for (const temperature of match.temperatureMatches) {
            if (temperature.result !== 'MATCH' ||
                !temperature.evidence.some((evidence) => evidence.result === 'MATCH')) {
                continue;
            }
            features.add(this.temperatureFeature(temperature));
        }
        return [...features];
    }
    temperatureFeature(match) {
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
};
exports.TechnicalRankingService = TechnicalRankingService;
exports.TechnicalRankingService = TechnicalRankingService = __decorate([
    (0, common_1.Injectable)()
], TechnicalRankingService);
//# sourceMappingURL=technical-ranking.service.js.map