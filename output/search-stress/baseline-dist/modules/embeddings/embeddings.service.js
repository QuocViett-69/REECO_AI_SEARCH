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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingsService = void 0;
const common_1 = require("@nestjs/common");
const embedding_provider_1 = require("../../ai/embedding.provider");
const ollama_embedding_provider_1 = require("../../ai/ollama-embedding.provider");
const configuration_1 = require("../../config/configuration");
let EmbeddingsService = class EmbeddingsService {
    provider;
    batchSize = (0, configuration_1.configuration)().embedding.batchSize;
    constructor(provider) {
        this.provider = provider;
        if (!Number.isSafeInteger(this.batchSize) || this.batchSize <= 0) {
            throw new Error('EMBEDDING_CONFIG_INVALID: batch size must be positive');
        }
    }
    isConfigured() {
        return this.provider instanceof ollama_embedding_provider_1.OllamaEmbeddingProvider;
    }
    getConfigurationMetadata() {
        if (!(this.provider instanceof ollama_embedding_provider_1.OllamaEmbeddingProvider)) {
            throw new Error('EMBEDDING_CONFIG_INVALID: unsupported provider');
        }
        const { config } = this.provider;
        return {
            provider: config.provider,
            model: config.model,
            dimensions: config.dimensions,
            version: config.version,
            timeout_ms: config.timeoutMs,
            batch_size: this.batchSize,
        };
    }
    embedQuery(text) {
        return this.provider.embed(text);
    }
    async embedDocuments(texts) {
        if (texts.length === 0)
            return this.provider.embedMany(texts);
        const embeddings = [];
        for (let offset = 0; offset < texts.length; offset += this.batchSize) {
            embeddings.push(...(await this.provider.embedMany(texts.slice(offset, offset + this.batchSize))));
        }
        return embeddings;
    }
};
exports.EmbeddingsService = EmbeddingsService;
exports.EmbeddingsService = EmbeddingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(embedding_provider_1.EMBEDDING_PROVIDER)),
    __metadata("design:paramtypes", [Object])
], EmbeddingsService);
//# sourceMappingURL=embeddings.service.js.map