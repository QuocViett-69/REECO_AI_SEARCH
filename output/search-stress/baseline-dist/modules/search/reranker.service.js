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
var RerankerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RerankerService = void 0;
exports.serializeRerankerCandidate = serializeRerankerCandidate;
const common_1 = require("@nestjs/common");
const configuration_1 = require("../../config/configuration");
const products_service_1 = require("../products/products.service");
const uniqueLabels = (items) => [
    ...new Set(items.flatMap((item) => [item.label_en, item.label_vi]).filter(Boolean)),
].join('; ');
function serializeRerankerCandidate(document, parsed, matchedFeatures) {
    const specifications = parsed.temperatureConstraints.length > 0
        ? document.important_specifications.filter((item) => item.quantity_kind === 'temperature' &&
            item.normalized_value.type === 'range')
        : [];
    return [
        `Model: ${document.model}`,
        `Product: ${[document.name_en, document.name_vi].filter(Boolean).join(' | ')}`,
        `Taxonomy: ${[
            document.taxonomy.category,
            document.taxonomy.subcategory,
            document.taxonomy.device_type,
        ]
            .filter(Boolean)
            .join(' > ')}`,
        `Measurements: ${uniqueLabels(document.measurements)}`,
        `Capabilities: ${uniqueLabels(document.capabilities)}`,
        `Applications: ${uniqueLabels(document.applications)}`,
        `Protocols: ${document.supported_protocols.join('; ')}`,
        `Relevant specifications: ${specifications
            .map((item) => `${item.canonical_key}=${JSON.stringify(item.normalized_value)}`)
            .join('; ')}`,
        `Matched structured features: ${matchedFeatures.join('; ')}`,
    ].join('\n');
}
let RerankerService = RerankerService_1 = class RerankerService {
    productsService;
    logger = new common_1.Logger(RerankerService_1.name);
    config = (0, configuration_1.configuration)().reranker;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async rerank(query, parsed, baseline) {
        if (!this.config.enabled || baseline.length < 2)
            return baseline;
        const prefix = baseline.slice(0, this.config.topN);
        const startedAt = performance.now();
        try {
            const candidates = await this.candidates(prefix, parsed);
            const response = await this.request(query, candidates);
            const orderedIds = this.validate(response, candidates);
            const exactIdentity = prefix.find((candidate) => candidate.technical.exactIdentity)?.candidate.productId;
            const protectedIds = exactIdentity
                ? [exactIdentity, ...orderedIds.filter((id) => id !== exactIdentity)]
                : orderedIds;
            const byId = new Map(prefix.map((candidate) => [candidate.candidate.productId, candidate]));
            this.logTelemetry(true, null, performance.now() - startedAt, prefix.length);
            return [
                ...protectedIds.map((id) => byId.get(id)),
                ...baseline.slice(prefix.length),
            ];
        }
        catch (error) {
            this.logTelemetry(false, this.failureReason(error), performance.now() - startedAt, prefix.length);
            return baseline;
        }
    }
    async candidates(prefix, parsed) {
        const ids = prefix.map((item) => item.candidate.productId);
        const documents = await this.productsService.getSearchDocumentsByIds(ids);
        return prefix.map((item) => {
            const document = documents.get(item.candidate.productId);
            if (!document)
                throw new Error('MISSING_DOCUMENT');
            return {
                product_id: item.candidate.productId,
                document: serializeRerankerCandidate(document, parsed, this.offlineMatchedFeatures(document, parsed)),
            };
        });
    }
    offlineMatchedFeatures(document, parsed) {
        const features = [];
        if (parsed.identity?.productId === document.product_id) {
            features.push(`identity:${parsed.identity.matchedField}:${parsed.identity.model}`);
        }
        for (const protocol of parsed.protocols) {
            if (document.supported_protocols.some((supported) => protocol === 'Modbus'
                ? supported === 'Modbus' || supported.startsWith('Modbus ')
                : supported === protocol)) {
                features.push(`protocol:${protocol}`);
            }
        }
        return features;
    }
    async request(query, candidates) {
        const response = await fetch(`${this.config.baseUrl}/rerank`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ query, candidates }),
            signal: AbortSignal.timeout(this.config.timeoutMs),
        });
        if (!response.ok)
            throw new Error('HTTP_ERROR');
        return (await response.json());
    }
    validate(response, candidates) {
        if (!response ||
            response.model !== this.config.model ||
            response.revision !== this.config.revision ||
            !Number.isFinite(response.latency_ms) ||
            !Array.isArray(response.results)) {
            throw new Error('MALFORMED_RESPONSE');
        }
        const allowed = new Set(candidates.map((candidate) => candidate.product_id));
        const ids = response.results.map((result) => result?.product_id);
        if (ids.length !== allowed.size ||
            new Set(ids).size !== ids.length ||
            ids.some((id) => !allowed.has(id)) ||
            response.results.some((result) => !Number.isFinite(result?.score))) {
            throw new Error('INVALID_CANDIDATE_SET');
        }
        return ids;
    }
    failureReason(error) {
        if (error instanceof Error && error.name === 'TimeoutError')
            return 'timeout';
        if (error instanceof TypeError)
            return 'unavailable';
        if (error instanceof Error && error.message === 'INVALID_CANDIDATE_SET') {
            return 'invalid_candidate_set';
        }
        if (error instanceof Error && error.message === 'MISSING_DOCUMENT') {
            return 'missing_document';
        }
        return 'invalid_response';
    }
    logTelemetry(success, fallbackReason, latencyMs, candidateCount) {
        const payload = JSON.stringify({
            reranker_enabled: true,
            reranker_attempted: true,
            reranker_success: success,
            reranker_fallback_reason: fallbackReason,
            reranker_latency_ms: Number(latencyMs.toFixed(3)),
            reranker_candidate_count: candidateCount,
        });
        if (success)
            this.logger.debug(payload);
        else
            this.logger.warn(payload);
    }
};
exports.RerankerService = RerankerService;
exports.RerankerService = RerankerService = RerankerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], RerankerService);
//# sourceMappingURL=reranker.service.js.map