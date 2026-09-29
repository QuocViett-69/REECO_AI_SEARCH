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
exports.SemanticSearchService = exports.SemanticSearchError = void 0;
const common_1 = require("@nestjs/common");
const ollama_embedding_provider_1 = require("../../ai/ollama-embedding.provider");
const configuration_1 = require("../../config/configuration");
const supabase_service_1 = require("../../database/supabase/supabase.service");
const embeddings_service_1 = require("../embeddings/embeddings.service");
class SemanticSearchError extends Error {
    code;
    constructor(code, message, options) {
        super(message, options);
        this.code = code;
        this.name = 'SemanticSearchError';
    }
}
exports.SemanticSearchError = SemanticSearchError;
let SemanticSearchService = class SemanticSearchService {
    embeddings;
    supabase;
    defaultRetrievalLimit = (0, configuration_1.configuration)().search.retrievalLimit;
    constructor(embeddings, supabase) {
        this.embeddings = embeddings;
        this.supabase = supabase;
    }
    async search(query, limit) {
        const normalizedQuery = this.normalizeQuery(query);
        const retrievalLimit = this.normalizeLimit(limit);
        const metadata = this.getEmbeddingMetadata();
        const queryEmbedding = await this.embedQuery(normalizedQuery, metadata);
        let response;
        try {
            response = await this.supabase
                .getClient()
                .rpc('search_products_semantic', {
                query_embedding: queryEmbedding,
                required_embedding_model: metadata.model,
                required_embedding_version: metadata.version,
                result_limit: retrievalLimit,
            });
        }
        catch (cause) {
            throw new SemanticSearchError('SEMANTIC_RPC_FAILED', 'Semantic search is temporarily unavailable', { cause });
        }
        if (response.error) {
            throw new SemanticSearchError('SEMANTIC_RPC_FAILED', 'Semantic search is temporarily unavailable', { cause: response.error });
        }
        return this.validateResponse(response.data);
    }
    normalizeQuery(query) {
        if (typeof query !== 'string' || query.trim().length === 0) {
            throw new SemanticSearchError('SEMANTIC_QUERY_INVALID', 'Semantic search query must be a non-empty string');
        }
        return query.trim();
    }
    normalizeLimit(limit) {
        const candidate = limit ?? this.defaultRetrievalLimit;
        if (!Number.isSafeInteger(candidate)) {
            throw new SemanticSearchError('SEMANTIC_CONFIG_INVALID', 'Semantic retrieval limit must be an integer');
        }
        return Math.min(100, Math.max(1, candidate));
    }
    getEmbeddingMetadata() {
        let metadata;
        try {
            metadata = this.embeddings.getConfigurationMetadata();
        }
        catch (cause) {
            throw new SemanticSearchError('SEMANTIC_CONFIG_INVALID', 'Semantic embedding configuration is invalid', { cause });
        }
        if (metadata.dimensions !== ollama_embedding_provider_1.OLLAMA_EMBEDDING_DIMENSIONS ||
            metadata.model.trim().length === 0 ||
            metadata.version.trim().length === 0) {
            throw new SemanticSearchError('SEMANTIC_CONFIG_INVALID', 'Semantic embedding configuration is invalid');
        }
        return metadata;
    }
    async embedQuery(query, metadata) {
        let embedding;
        try {
            embedding = await this.embeddings.embedQuery(query);
        }
        catch (cause) {
            throw new SemanticSearchError('SEMANTIC_EMBEDDING_UNAVAILABLE', 'Semantic embedding is temporarily unavailable', { cause });
        }
        if (!Array.isArray(embedding) || embedding.length !== metadata.dimensions) {
            throw new SemanticSearchError('SEMANTIC_EMBEDDING_UNAVAILABLE', 'Semantic embedding is temporarily unavailable');
        }
        return embedding;
    }
    validateResponse(value) {
        if (value === null)
            return [];
        if (!Array.isArray(value))
            this.throwInvalidResponse();
        const productIds = new Set();
        return value.map((candidate, index) => {
            if (!this.isValidRpcRow(candidate))
                this.throwInvalidResponse();
            const row = candidate;
            if (productIds.has(row.product_id))
                this.throwInvalidResponse();
            productIds.add(row.product_id);
            return {
                productId: row.product_id,
                model: row.model,
                productNameEn: row.product_name_en,
                similarity: row.similarity,
                rank: index + 1,
            };
        });
    }
    isValidRpcRow(value) {
        if (typeof value !== 'object' || value === null)
            return false;
        const row = value;
        return (typeof row.product_id === 'string' &&
            row.product_id.trim().length > 0 &&
            typeof row.model === 'string' &&
            row.model.trim().length > 0 &&
            typeof row.product_name_en === 'string' &&
            row.product_name_en.trim().length > 0 &&
            typeof row.similarity === 'number' &&
            Number.isFinite(row.similarity) &&
            row.similarity >= 0 &&
            row.similarity <= 1);
    }
    throwInvalidResponse() {
        throw new SemanticSearchError('SEMANTIC_RPC_INVALID_RESPONSE', 'Semantic search returned an invalid response');
    }
};
exports.SemanticSearchService = SemanticSearchService;
exports.SemanticSearchService = SemanticSearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [embeddings_service_1.EmbeddingsService,
        supabase_service_1.SupabaseService])
], SemanticSearchService);
//# sourceMappingURL=semantic-search.service.js.map