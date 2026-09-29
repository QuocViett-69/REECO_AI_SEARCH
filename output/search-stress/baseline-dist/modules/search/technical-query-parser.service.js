"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalQueryParserService = void 0;
const common_1 = require("@nestjs/common");
const technical_query_constants_1 = require("./technical-query.constants");
const NUMBER_PATTERN = String.raw `[+\-−]?\d+(?:\.\d+)?`;
const CELSIUS_PATTERN = String.raw `(?:°\s*C|deg(?:rees?)?\s*C|C)`;
const RANGE_PATTERN = new RegExp(String.raw `(${NUMBER_PATTERN})\s*(?:°\s*C|deg(?:rees?)?\s*C)?\s*(?:to|\.\.\.|đến|tới)\s*(${NUMBER_PATTERN})\s*(${CELSIUS_PATTERN})(?![\p{L}\p{N}])`, 'iu');
const POINT_PATTERN = new RegExp(String.raw `(${NUMBER_PATTERN})\s*(${CELSIUS_PATTERN})(?![\p{L}\p{N}])`, 'iu');
let TechnicalQueryParserService = class TechnicalQueryParserService {
    parse(query, catalog = []) {
        const originalQuery = query.normalize('NFC').trim();
        const identity = this.parseIdentity(originalQuery, catalog);
        const protocols = this.parseProtocols(originalQuery);
        const temperatureConstraints = this.parseTemperature(originalQuery);
        return {
            parserVersion: technical_query_constants_1.TECHNICAL_QUERY_PARSER_VERSION,
            originalQuery,
            identity,
            protocols,
            temperatureConstraints,
            confidence: {
                identity: identity ? 'high' : 'none',
                protocol: protocols.length > 0 ? 'high' : 'none',
                temperature: temperatureConstraints.some((constraint) => constraint.confidence === 'high')
                    ? 'high'
                    : 'none',
            },
        };
    }
    parseIdentity(query, catalog) {
        const queryKey = this.identityKey(query);
        if (queryKey.length === 0)
            return null;
        const matches = new Map();
        for (const product of catalog) {
            for (const [field, value] of [
                ['product_id', product.productId],
                ['model', product.model],
            ]) {
                if (this.identityKey(value) !== queryKey)
                    continue;
                const existing = matches.get(product.productId);
                if (existing) {
                    existing.matchedFields.add(field);
                }
                else {
                    matches.set(product.productId, {
                        productId: product.productId,
                        model: product.model,
                        matchedField: field,
                        matchedFields: new Set([field]),
                    });
                }
            }
        }
        if (matches.size !== 1)
            return null;
        const match = [...matches.values()][0];
        return {
            productId: match.productId,
            model: match.model,
            matchedField: match.matchedFields.has('product_id')
                ? 'product_id'
                : 'model',
        };
    }
    identityKey(value) {
        return value
            .normalize('NFC')
            .trim()
            .toLocaleUpperCase('en-US')
            .replace(/\s+/gu, '')
            .replace(/[-_]/gu, '');
    }
    parseProtocols(query) {
        const normalized = query
            .normalize('NFC')
            .replace(/[‐‑–—]/gu, '-')
            .toLocaleLowerCase('en-US');
        const protocols = [];
        if (/\bsdi[\s-]?12\b/iu.test(normalized))
            protocols.push('SDI-12');
        if (/\brs[\s-]?485\b/iu.test(normalized))
            protocols.push('RS-485');
        if (/\bwi[\s-]?fi\b/iu.test(normalized))
            protocols.push('Wi-Fi');
        if (/\bmodbus\s+rtu\b/iu.test(normalized)) {
            protocols.push('Modbus RTU');
        }
        else if (!/\bmodbus\s+(?:ascii|tcp)\b/iu.test(normalized)) {
            if (/\bmodbus\b/iu.test(normalized))
                protocols.push('Modbus');
        }
        return protocols;
    }
    parseTemperature(query) {
        const range = RANGE_PATTERN.exec(query);
        if (range) {
            const minCelsius = this.parseNumber(range[1]);
            const maxCelsius = this.parseNumber(range[2]);
            if (minCelsius > maxCelsius)
                return [];
            const intent = this.temperatureIntent(query, 'range');
            return [
                {
                    kind: 'range',
                    intent,
                    minCelsius,
                    maxCelsius,
                    unit: technical_query_constants_1.CELSIUS_UNIT,
                    confidence: intent === 'ambiguous' ? 'none' : 'high',
                },
            ];
        }
        const point = POINT_PATTERN.exec(query);
        if (!point)
            return [];
        const valueCelsius = this.parseNumber(point[1]);
        const intent = this.temperatureIntent(query, 'point');
        if (intent === 'measurement') {
            return [
                {
                    kind: 'upper_bound',
                    intent,
                    valueCelsius,
                    unit: technical_query_constants_1.CELSIUS_UNIT,
                    confidence: 'high',
                },
            ];
        }
        return [
            {
                kind: 'point',
                intent,
                valueCelsius,
                unit: technical_query_constants_1.CELSIUS_UNIT,
                confidence: intent === 'ambiguous' ? 'none' : 'high',
            },
        ];
    }
    temperatureIntent(query, kind) {
        const normalized = query.normalize('NFC').toLocaleLowerCase('en-US');
        const measurement = /\bmeasure(?:s|d|ment|ments|ing)?\s+up\s+to\b/iu.test(normalized) ||
            /(?:^|[^\p{L}\p{N}])đo\s+(?:tới|đến)(?=$|[^\p{L}\p{N}])/iu.test(normalized);
        if (measurement)
            return 'measurement';
        const operating = /\boperat(?:e|es|ing)\b/iu.test(normalized) ||
            /\boperating\s+temperature\b/iu.test(normalized) ||
            /(?:^|[^\p{L}\p{N}])hoạt\s+động\s+(?:ở|tại)(?=$|[^\p{L}\p{N}])/iu.test(normalized) ||
            /(?:^|[^\p{L}\p{N}])nhiệt\s+độ\s+hoạt\s+động(?=$|[^\p{L}\p{N}])/iu.test(normalized);
        if (operating)
            return 'operating';
        if (kind === 'range')
            return 'ambiguous';
        return 'ambiguous';
    }
    parseNumber(value) {
        return Number(value.replace('−', '-'));
    }
};
TechnicalQueryParserService = __decorate([
    (0, common_1.Injectable)()
], TechnicalQueryParserService);
exports.TechnicalQueryParserService = TechnicalQueryParserService;
