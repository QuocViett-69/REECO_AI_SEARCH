"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbeddingsModule = void 0;
const common_1 = require("@nestjs/common");
const embedding_provider_1 = require("../../ai/embedding.provider");
const ollama_embedding_provider_1 = require("../../ai/ollama-embedding.provider");
const configuration_1 = require("../../config/configuration");
const embeddings_service_1 = require("./embeddings.service");
let EmbeddingsModule = class EmbeddingsModule {
};
exports.EmbeddingsModule = EmbeddingsModule;
exports.EmbeddingsModule = EmbeddingsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: embedding_provider_1.EMBEDDING_PROVIDER,
                useFactory: () => {
                    const embedding = (0, configuration_1.configuration)().embedding;
                    return new ollama_embedding_provider_1.OllamaEmbeddingProvider({
                        provider: embedding.provider,
                        baseUrl: embedding.baseUrl,
                        model: embedding.model,
                        dimensions: embedding.dimensions,
                        version: embedding.version,
                        timeoutMs: embedding.timeoutMs,
                    });
                },
            },
            embeddings_service_1.EmbeddingsService,
        ],
        exports: [embeddings_service_1.EmbeddingsService],
    })
], EmbeddingsModule);
//# sourceMappingURL=embeddings.module.js.map