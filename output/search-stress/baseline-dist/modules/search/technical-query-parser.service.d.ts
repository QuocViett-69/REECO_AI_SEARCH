import { CELSIUS_UNIT, SUPPORTED_TECHNICAL_PROTOCOLS, TECHNICAL_QUERY_PARSER_VERSION } from './technical-query.constants';
export type TechnicalConfidence = 'high' | 'none';
export type TemperatureIntent = 'operating' | 'measurement' | 'ambiguous';
export interface TechnicalProductIdentity {
    productId: string;
    model: string;
}
export interface ParsedIdentity {
    productId: string;
    model: string;
    matchedField: 'product_id' | 'model';
}
export type ParsedTechnicalProtocol = (typeof SUPPORTED_TECHNICAL_PROTOCOLS)[number];
interface TemperatureConstraintBase {
    intent: TemperatureIntent;
    unit: typeof CELSIUS_UNIT;
    confidence: TechnicalConfidence;
}
export type TemperatureConstraint = (TemperatureConstraintBase & {
    kind: 'point';
    valueCelsius: number;
}) | (TemperatureConstraintBase & {
    kind: 'upper_bound';
    valueCelsius: number;
}) | (TemperatureConstraintBase & {
    kind: 'range';
    minCelsius: number;
    maxCelsius: number;
});
export interface ParsedTechnicalQuery {
    parserVersion: typeof TECHNICAL_QUERY_PARSER_VERSION;
    originalQuery: string;
    identity: ParsedIdentity | null;
    protocols: ParsedTechnicalProtocol[];
    temperatureConstraints: TemperatureConstraint[];
    confidence: {
        identity: TechnicalConfidence;
        protocol: TechnicalConfidence;
        temperature: TechnicalConfidence;
    };
}
export declare class TechnicalQueryParserService {
    parse(query: string, catalog?: readonly TechnicalProductIdentity[]): ParsedTechnicalQuery;
    private parseIdentity;
    private identityKey;
    private parseProtocols;
    private parseTemperature;
    private temperatureIntent;
    private parseNumber;
}
export {};
