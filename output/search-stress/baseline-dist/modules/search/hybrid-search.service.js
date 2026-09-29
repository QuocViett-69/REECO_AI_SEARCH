"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridSearchService = exports.HybridSearchError = void 0;
const common_1 = require("@nestjs/common");
const configuration_1 = require("../../config/configuration");
const keyword_search_service_1 = require("./keyword-search.service");
const search_score_service_1 = require("./search-score.service");
const semantic_search_service_1 = require("./semantic-search.service");
class HybridSearchError extends Error {
    code;
    constructor(code, message, options) {
        super(message, options);
        this.code = code;
        this.name = 'HybridSearchError';
    }
}
exports.HybridSearchError = HybridSearchError;
let HybridSearchService = class HybridSearchService {
    keywordSearch;
    semanticSearch;
    searchScore;
    defaultRetrievalLimit = (0, configuration_1.configuration)().search.retrievalLimit;
    constructor(keywordSearch, semanticSearch, searchScore) {
        this.keywordSearch = keywordSearch;
        this.semanticSearch = semanticSearch;
        this.searchScore = searchScore;
    }
    async search(query, limit) {
        const retrievalLimit = this.normalizeLimit(limit);
        const [keywordResult, semanticResult] = await Promise.allSettled([
            this.keywordSearch.search(query, retrievalLimit),
            this.semanticSearch.search(query, retrievalLimit),
        ]);
        const keywordSucceeded = keywordResult.status === 'fulfilled';
        const semanticSucceeded = semanticResult.status === 'fulfilled';
        if (!keywordSucceeded && !semanticSucceeded) {
            throw new HybridSearchError('HYBRID_RETRIEVAL_FAILED', 'Hybrid retrieval is temporarily unavailable', {
                cause: new AggregateError([keywordResult.reason, semanticResult.reason], 'Both hybrid retrieval sources failed'),
            });
        }
        const keywordRows = keywordSucceeded ? keywordResult.value : [];
        const semanticCandidates = semanticSucceeded ? semanticResult.value : [];
        const mode = keywordSucceeded
            ? semanticSucceeded
                ? 'hybrid'
                : 'keyword_fallback'
            : 'semantic_fallback';
        const candidates = this.fuseCandidates(keywordRows, semanticCandidates, mode);
        return {
            mode,
            candidates,
            diagnostics: {
                keywordSucceeded,
                semanticSucceeded,
                keywordCount: keywordRows.length,
                semanticCount: semanticCandidates.length,
                unionCount: candidates.length,
            },
        };
    }
    normalizeLimit(limit) {
        const candidate = limit ?? this.defaultRetrievalLimit;
        if (!Number.isSafeInteger(candidate)) {
            throw new HybridSearchError('HYBRID_CONFIG_INVALID', 'Hybrid retrieval limit must be an integer');
        }
        return Math.min(100, Math.max(1, candidate));
    }
    fuseCandidates(keywordRows, semanticCandidates, mode) {
        const candidates = new Map();
        for (let index = 0; index < keywordRows.length; index += 1) {
            const row = keywordRows[index];
            if (candidates.has(row.product_id))
                continue;
            const keywordRank = index + 1;
            candidates.set(row.product_id, {
                productId: row.product_id,
                model: row.model,
                productNameEn: row.product_name_en,
                keywordRank,
                semanticRank: null,
                keywordScore: row.rank,
                semanticScore: null,
                rrfScore: this.searchScore.calculateRrfScore(keywordRank, null),
                matchedBy: { keyword: true, semantic: false },
            });
        }
        for (const semantic of semanticCandidates) {
            const existing = candidates.get(semantic.productId);
            if (existing) {
                if (existing.semanticRank !== null)
                    continue;
                existing.semanticRank = semantic.rank;
                existing.semanticScore = semantic.similarity;
                existing.matchedBy.semantic = true;
                existing.rrfScore = this.searchScore.calculateRrfScore(existing.keywordRank, semantic.rank);
            }
            else {
                candidates.set(semantic.productId, {
                    productId: semantic.productId,
                    model: semantic.model,
                    productNameEn: semantic.productNameEn,
                    keywordRank: null,
                    semanticRank: semantic.rank,
                    keywordScore: null,
                    semanticScore: semantic.similarity,
                    rrfScore: this.searchScore.calculateRrfScore(null, semantic.rank),
                    matchedBy: { keyword: false, semantic: true },
                });
            }
        }
        const result = [...candidates.values()];
        if (mode === 'keyword_fallback') {
            return result.sort((left, right) => left.keywordRank - right.keywordRank);
        }
        if (mode === 'semantic_fallback') {
            return result.sort((left, right) => left.semanticRank - right.semanticRank);
        }
        return result.sort((left, right) => this.searchScore.compareHybridCandidates(left, right));
    }
};
exports.HybridSearchService = HybridSearchService;
exports.HybridSearchService = HybridSearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [keyword_search_service_1.KeywordSearchService,
        semantic_search_service_1.SemanticSearchService,
        search_score_service_1.SearchScoreService])
], HybridSearchService);
//# sourceMappingURL=hybrid-search.service.js.map