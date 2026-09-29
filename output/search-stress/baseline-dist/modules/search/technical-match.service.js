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
exports.TechnicalMatchService = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("../products/products.service");
const technical_query_constants_1 = require("./technical-query.constants");
const operatingTemperatureKeys = new Set(technical_query_constants_1.OPERATING_TEMPERATURE_KEYS);
const measurementTemperatureKeys = new Set(technical_query_constants_1.MEASUREMENT_TEMPERATURE_KEYS);
let TechnicalMatchService = class TechnicalMatchService {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async evaluate(parsedQuery, candidateProductIds) {
        const evidenceById = await this.productsService.getTechnicalEvidenceByIds(candidateProductIds);
        return candidateProductIds.map((productId) => {
            const evidence = evidenceById.get(productId);
            const identity = evidence && parsedQuery.identity?.productId === productId
                ? this.identityEvidence(parsedQuery, evidence.product)
                : [];
            const protocolMatches = parsedQuery.protocols.map((protocol) => this.evaluateProtocol(protocol, evidence?.document ?? null));
            const temperatureMatches = parsedQuery.temperatureConstraints.map((constraint) => this.evaluateTemperature(constraint, evidence?.specifications ?? []));
            return {
                productId,
                identityMatch: identity.length > 0 ? 'exact' : 'none',
                identityEvidence: identity,
                protocolMatches,
                temperatureMatches,
                hardMismatch: temperatureMatches.some((match) => match.result === 'MISMATCH'),
            };
        });
    }
    identityEvidence(parsedQuery, product) {
        const identity = parsedQuery.identity;
        if (!identity || identity.productId !== product.product_id)
            return [];
        return [
            {
                source: 'products',
                field: identity.matchedField,
                value: identity.matchedField === 'product_id'
                    ? product.product_id
                    : product.model,
            },
        ];
    }
    evaluateProtocol(queryProtocol, document) {
        if (!document) {
            return { queryProtocol, result: 'UNKNOWN', evidence: [] };
        }
        const selected = document.variants?.find(variant => variant.model === document.model);
        const option = selected?.distinguishing_specifications.find(spec => spec.name_en === 'Communication Option');
        if (queryProtocol === 'Wi-Fi' && option && !/^wi[\s-]?fi$/iu.test(option.value_raw)) {
            return { queryProtocol, result: 'UNKNOWN', evidence: [] };
        }
        const supported = document.supported_protocols.find((protocol) => this.protocolSatisfies(queryProtocol, protocol));
        if (supported) {
            return {
                queryProtocol,
                result: 'MATCH',
                evidence: [
                    {
                        source: 'product_document',
                        canonicalProtocol: supported,
                        relation: 'supported',
                    },
                ],
            };
        }
        const unsupported = document.unsupported_protocols.find((protocol) => this.protocolSatisfies(queryProtocol, protocol));
        if (unsupported) {
            return {
                queryProtocol,
                result: 'MISMATCH',
                evidence: [
                    {
                        source: 'product_document',
                        canonicalProtocol: unsupported,
                        relation: 'unsupported',
                    },
                ],
            };
        }
        return { queryProtocol, result: 'UNKNOWN', evidence: [] };
    }
    protocolSatisfies(queryProtocol, evidenceProtocol) {
        if (queryProtocol === 'Modbus') {
            return (evidenceProtocol === 'Modbus' || evidenceProtocol.startsWith('Modbus '));
        }
        return evidenceProtocol === queryProtocol;
    }
    evaluateTemperature(constraint, specifications) {
        if (constraint.confidence !== 'high' || constraint.intent === 'ambiguous') {
            return { constraint, result: 'UNKNOWN', evidence: [] };
        }
        const approvedKeys = constraint.intent === 'operating'
            ? operatingTemperatureKeys
            : measurementTemperatureKeys;
        const relevant = specifications.filter((specification) => approvedKeys.has(specification.canonical_key));
        if (relevant.length === 0) {
            return { constraint, result: 'UNKNOWN', evidence: [] };
        }
        const evidence = relevant.map((specification) => this.evaluateTemperatureSpecification(constraint, specification));
        const result = evidence.some((item) => item.result === 'MATCH')
            ? 'MATCH'
            : evidence.every((item) => item.result === 'MISMATCH')
                ? 'MISMATCH'
                : 'UNKNOWN';
        return { constraint, result, evidence };
    }
    evaluateTemperatureSpecification(constraint, specification) {
        const normalized = specification.normalized_value;
        if (normalized.type !== 'range' ||
            normalized.min_value === undefined ||
            normalized.max_value === undefined ||
            normalized.unit !== technical_query_constants_1.CELSIUS_UNIT) {
            return {
                source: 'normalized_spec',
                canonicalKey: specification.canonical_key,
                candidateRange: null,
                result: 'UNKNOWN',
                rawRef: specification.raw_ref,
            };
        }
        const candidateRange = {
            minCelsius: normalized.min_value,
            maxCelsius: normalized.max_value,
            unit: technical_query_constants_1.CELSIUS_UNIT,
        };
        let matches;
        if (constraint.kind === 'range') {
            matches =
                normalized.min_value <= constraint.minCelsius &&
                    normalized.max_value >= constraint.maxCelsius;
        }
        else if (constraint.kind === 'upper_bound') {
            matches = normalized.max_value >= constraint.valueCelsius;
        }
        else {
            matches =
                normalized.min_value <= constraint.valueCelsius &&
                    normalized.max_value >= constraint.valueCelsius;
        }
        return {
            source: 'normalized_spec',
            canonicalKey: specification.canonical_key,
            candidateRange,
            result: matches ? 'MATCH' : 'MISMATCH',
            rawRef: specification.raw_ref,
        };
    }
};
exports.TechnicalMatchService = TechnicalMatchService;
exports.TechnicalMatchService = TechnicalMatchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], TechnicalMatchService);
//# sourceMappingURL=technical-match.service.js.map