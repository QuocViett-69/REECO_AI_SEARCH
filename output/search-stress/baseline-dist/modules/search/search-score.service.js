"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchScoreService = exports.MAX_RRF_K = void 0;
const common_1 = require("@nestjs/common");
const configuration_1 = require("../../config/configuration");
exports.MAX_RRF_K = 1000;
let SearchScoreService = class SearchScoreService {
    rrfK = this.validateK((0, configuration_1.configuration)().search.rrfK);
    getRrfK() {
        return this.rrfK;
    }
    calculateRrfContribution(rank, k = this.rrfK) {
        this.validateRank(rank);
        this.validateK(k);
        return 1 / (k + rank);
    }
    calculateRrfScore(keywordRank, semanticRank, k = this.rrfK) {
        this.validateK(k);
        return ((keywordRank === null
            ? 0
            : this.calculateRrfContribution(keywordRank, k)) +
            (semanticRank === null
                ? 0
                : this.calculateRrfContribution(semanticRank, k)));
    }
    compareHybridCandidates(left, right) {
        const scoreOrder = right.rrfScore - left.rrfScore;
        if (scoreOrder !== 0)
            return scoreOrder;
        const leftBoth = left.matchedBy.keyword && left.matchedBy.semantic;
        const rightBoth = right.matchedBy.keyword && right.matchedBy.semantic;
        if (leftBoth !== rightBoth)
            return leftBoth ? -1 : 1;
        const keywordOrder = this.compareNullableRanks(left.keywordRank, right.keywordRank);
        if (keywordOrder !== 0)
            return keywordOrder;
        const semanticOrder = this.compareNullableRanks(left.semanticRank, right.semanticRank);
        if (semanticOrder !== 0)
            return semanticOrder;
        if (left.productId === right.productId)
            return 0;
        return left.productId < right.productId ? -1 : 1;
    }
    compareNullableRanks(left, right) {
        if (left === null && right === null)
            return 0;
        if (left === null)
            return 1;
        if (right === null)
            return -1;
        return left - right;
    }
    validateRank(rank) {
        if (!Number.isSafeInteger(rank) || rank <= 0) {
            throw new Error('RRF rank must be a positive integer');
        }
    }
    validateK(k) {
        if (!Number.isSafeInteger(k) || k <= 0 || k > exports.MAX_RRF_K) {
            throw new Error(`RRF K must be an integer between 1 and ${exports.MAX_RRF_K}`);
        }
        return k;
    }
};
exports.SearchScoreService = SearchScoreService;
exports.SearchScoreService = SearchScoreService = __decorate([
    (0, common_1.Injectable)()
], SearchScoreService);
//# sourceMappingURL=search-score.service.js.map