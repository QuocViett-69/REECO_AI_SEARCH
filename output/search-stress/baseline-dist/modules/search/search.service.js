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
var SearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@reeco/shared");
const configuration_1 = require("../../config/configuration");
const products_service_1 = require("../products/products.service");
const conversation_query_1 = require("./conversation-query");
const explanation_service_1 = require("./explanation.service");
const hybrid_search_service_1 = require("./hybrid-search.service");
const technical_match_service_1 = require("./technical-match.service");
const reranker_service_1 = require("./reranker.service");
const technical_query_parser_service_1 = require("./technical-query-parser.service");
const search_intent_1 = require("./search-intent");
const technical_ranking_service_1 = require("./technical-ranking.service");
let SearchService = SearchService_1 = class SearchService {
    hybridSearch;
    productsService;
    technicalQueryParser;
    technicalMatch;
    technicalRanking;
    reranker;
    explanation;
    logger = new common_1.Logger(SearchService_1.name);
    configuredRetrievalLimit = (0, configuration_1.configuration)().search.retrievalLimit;
    constructor(hybridSearch, productsService, technicalQueryParser, technicalMatch, technicalRanking, reranker, explanation) {
        this.hybridSearch = hybridSearch;
        this.productsService = productsService;
        this.technicalQueryParser = technicalQueryParser;
        this.technicalMatch = technicalMatch;
        this.technicalRanking = technicalRanking;
        this.reranker = reranker;
        this.explanation = explanation;
    }
    async search(request) {
        try {
            return await this.searchOnce(request);
        }
        catch (error) {
            if (!(error instanceof common_1.ServiceUnavailableException))
                throw error;
            this.logger.warn('Search dependency unavailable; retrying once');
            return this.searchOnce(request);
        }
    }
    async searchOnce(request) {
        if ((0, conversation_query_1.hasUnsupportedNegativeConstraint)(request.query)) {
            throw new common_1.BadRequestException('Negative search constraints are not supported');
        }
        const resolution = (0, conversation_query_1.resolveConversationQuery)(request.query, request.context);
        const searchQuery = resolution.query;
        const retrievalQuery = resolution.applied && (0, conversation_query_1.hasTechnicalConstraint)(request.query)
            ? request.context.base_query
            : searchQuery;
        const retrievalLimit = Math.min(100, Math.max(1, this.configuredRetrievalLimit, request.limit));
        let hybridResult;
        try {
            hybridResult = await this.hybridSearch.search(retrievalQuery, retrievalLimit);
        }
        catch (error) {
            if (error instanceof hybrid_search_service_1.HybridSearchError &&
                error.code === 'HYBRID_RETRIEVAL_FAILED') {
                throw new common_1.ServiceUnavailableException('Search is temporarily unavailable');
            }
            throw error;
        }
        let scopedCandidates = resolution.applied && request.context
            ? hybridResult.candidates.filter((candidate) => request.context.product_ids.includes(candidate.productId))
            : hybridResult.candidates;
        const intent = (0, search_intent_1.parseSearchIntent)(searchQuery);
        let documents;
        let environmentalSpecifications = new Map();
        if (intent.constrained && scopedCandidates.length > 0) {
            const ids = scopedCandidates.map((item) => item.productId);
            [documents, environmentalSpecifications] = await Promise.all([
                this.productsService.getSearchDocumentsByIds(ids),
                intent.outdoor ? this.productsService.getEnvironmentalSpecificationsByIds(ids) : Promise.resolve(environmentalSpecifications),
            ]);
            scopedCandidates = scopedCandidates.filter((candidate) => {
                const document = documents.get(candidate.productId);
                return document && (0, search_intent_1.matchSearchIntent)(intent, document, environmentalSpecifications.get(candidate.productId)) !== null;
            });
        }
        if (scopedCandidates.length === 0) {
            return shared_1.SearchResponseSchema.parse({
                query: request.query,
                ...(request.context && { resolved_query: searchQuery, context_applied: resolution.applied }),
                mode: this.mapMode(hybridResult.mode),
                results: [],
            });
        }
        const identityCatalog = await this.productsService.getActiveTechnicalIdentityCatalog();
        const parsedQuery = this.technicalQueryParser.parse(searchQuery, identityCatalog);
        const technicallyRankedCandidates = await this.applyTechnicalPolicy(parsedQuery, scopedCandidates);
        const rankedCandidates = await this.reranker.rerank(searchQuery, parsedQuery, technicallyRankedCandidates);
        const summaries = await this.productsService.getPublicSummariesByIds(rankedCandidates.map((ranked) => ranked.candidate.productId));
        const identityCandidates = parsedQuery.identity
            ? rankedCandidates.filter(item => item.candidate.productId === parsedQuery.identity.productId)
            : rankedCandidates;
        const results = identityCandidates
            .flatMap((ranked) => {
            const candidate = ranked.candidate;
            const product = summaries.get(candidate.productId);
            if (!product)
                return [];
            return [
                {
                    product_id: product.product_id,
                    model: product.model,
                    name_en: product.name_en,
                    name_vi: product.name_vi,
                    category: product.category,
                    device_type: product.device_type,
                    image_url: product.image_url,
                    matched_features: ranked.matchedFeatures,
                    scores: this.mapScores(candidate, hybridResult.mode),
                },
            ];
        })
            .slice(0, request.limit);
        return shared_1.SearchResponseSchema.parse({
            query: request.query,
            ...(request.context && { resolved_query: searchQuery, context_applied: resolution.applied }),
            mode: this.mapMode(hybridResult.mode),
            results: request.explain
                ? await this.withExplanations(searchQuery, parsedQuery, results, documents, environmentalSpecifications)
                : results,
        });
    }
    async withExplanations(query, parsedQuery, results, knownDocuments, environmentalSpecifications = new Map()) {
        if (results.length === 0)
            return results;
        const ids = results.map((item) => item.product_id);
        try {
            const [documents, matches] = await Promise.all([
                knownDocuments ?? this.productsService.getSearchDocumentsByIds(ids),
                this.hasApplicableTechnicalSignal(parsedQuery)
                    ? this.technicalMatch.evaluate(parsedQuery, ids)
                    : Promise.resolve([]),
            ]);
            const matchesById = new Map(matches.map((item) => [item.productId, item]));
            const explainable = results.flatMap((result) => {
                const document = documents.get(result.product_id);
                return document ? [{ productId: result.product_id, document, match: matchesById.get(result.product_id), specifications: environmentalSpecifications.get(result.product_id) }] : [];
            });
            const generated = await this.explanation.explainMany(query, explainable);
            const explanationsById = new Map(explainable.map((item, index) => [item.productId, generated[index]]));
            return results.map((result) => {
                const explanation = explanationsById.get(result.product_id);
                return explanation ? { ...result, explanation } : result;
            });
        }
        catch {
            this.logger.warn('Search explanations unavailable; returning ranked results');
            return results;
        }
    }
    async applyTechnicalPolicy(parsedQuery, candidates) {
        if (!this.hasApplicableTechnicalSignal(parsedQuery)) {
            return this.technicalRanking.preserve(candidates);
        }
        const matches = await this.technicalMatch.evaluate(parsedQuery, candidates.map((candidate) => candidate.productId));
        const allowed = new Set(matches.filter((match) => match.protocolMatches.every((item) => item.result === 'MATCH') &&
            match.temperatureMatches
                .filter((item) => item.constraint.confidence === 'high')
                .every((item) => item.result === 'MATCH')).map((match) => match.productId));
        return this.technicalRanking.rank(candidates.filter((item) => allowed.has(item.productId)), matches);
    }
    hasApplicableTechnicalSignal(parsedQuery) {
        return (parsedQuery.confidence.identity === 'high' ||
            parsedQuery.confidence.protocol === 'high' ||
            parsedQuery.temperatureConstraints.some((constraint) => constraint.confidence === 'high' && constraint.intent !== 'ambiguous'));
    }
    mapMode(mode) {
        if (mode === 'keyword_fallback')
            return 'keyword';
        if (mode === 'semantic_fallback')
            return 'semantic';
        return 'hybrid';
    }
    mapScores(candidate, mode) {
        if (mode === 'keyword_fallback') {
            return {
                keyword: candidate.keywordScore ?? 0,
                semantic: null,
                hybrid: null,
                rerank: null,
            };
        }
        if (mode === 'semantic_fallback') {
            return {
                keyword: 0,
                semantic: candidate.semanticScore,
                hybrid: null,
                rerank: null,
            };
        }
        return {
            keyword: candidate.keywordScore ?? 0,
            semantic: candidate.semanticScore,
            hybrid: candidate.rrfScore,
            rerank: null,
        };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = SearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hybrid_search_service_1.HybridSearchService,
        products_service_1.ProductsService,
        technical_query_parser_service_1.TechnicalQueryParserService,
        technical_match_service_1.TechnicalMatchService,
        technical_ranking_service_1.TechnicalRankingService,
        reranker_service_1.RerankerService,
        explanation_service_1.ExplanationService])
], SearchService);
//# sourceMappingURL=search.service.js.map