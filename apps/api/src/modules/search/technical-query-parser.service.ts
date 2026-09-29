import { Injectable } from '@nestjs/common';
import {
  CELSIUS_UNIT,
  SUPPORTED_TECHNICAL_PROTOCOLS,
  TECHNICAL_QUERY_PARSER_VERSION,
} from './technical-query.constants';

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

export type ParsedTechnicalProtocol =
  (typeof SUPPORTED_TECHNICAL_PROTOCOLS)[number];

interface TemperatureConstraintBase {
  intent: TemperatureIntent;
  unit: typeof CELSIUS_UNIT;
  confidence: TechnicalConfidence;
}

export type TemperatureConstraint =
  | (TemperatureConstraintBase & {
      kind: 'point';
      valueCelsius: number;
    })
  | (TemperatureConstraintBase & {
      kind: 'upper_bound';
      valueCelsius: number;
    })
  | (TemperatureConstraintBase & {
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

const NUMBER_PATTERN = String.raw`[+\-−]?\d+(?:\.\d+)?`;
const CELSIUS_PATTERN = String.raw`(?:°\s*C|deg(?:rees?)?\s*C|C)`;
const RANGE_PATTERN = new RegExp(
  String.raw`(${NUMBER_PATTERN})\s*(?:°\s*C|deg(?:rees?)?\s*C)?\s*(?:to|\.\.\.|đến|tới)\s*(${NUMBER_PATTERN})\s*(${CELSIUS_PATTERN})(?![\p{L}\p{N}])`,
  'iu',
);
const POINT_PATTERN = new RegExp(
  String.raw`(${NUMBER_PATTERN})\s*(${CELSIUS_PATTERN})(?![\p{L}\p{N}])`,
  'iu',
);

@Injectable()
export class TechnicalQueryParserService {
  parse(
    query: string,
    catalog: readonly TechnicalProductIdentity[] = [],
  ): ParsedTechnicalQuery {
    const originalQuery = query.normalize('NFC').trim();
    const identity = this.parseIdentity(originalQuery, catalog);
    const protocols = this.parseProtocols(originalQuery);
    const temperatureConstraints = this.parseTemperature(originalQuery);

    return {
      parserVersion: TECHNICAL_QUERY_PARSER_VERSION,
      originalQuery,
      identity,
      protocols,
      temperatureConstraints,
      confidence: {
        identity: identity ? 'high' : 'none',
        protocol: protocols.length > 0 ? 'high' : 'none',
        temperature: temperatureConstraints.some(
          (constraint) => constraint.confidence === 'high',
        )
          ? 'high'
          : 'none',
      },
    };
  }

  private parseIdentity(
    query: string,
    catalog: readonly TechnicalProductIdentity[],
  ): ParsedIdentity | null {
    const queryKey = this.identityKey(query);
    if (queryKey.length === 0) return null;

    const matches = new Map<
      string,
      ParsedIdentity & { matchedFields: Set<'product_id' | 'model'> }
    >();
    for (const product of catalog) {
      for (const [field, value] of [
        ['product_id', product.productId],
        ['model', product.model],
      ] as const) {
        const key = this.identityKey(value);
        // Catalog identifiers may appear beside intent words. Numeric-only model names
        // require the whole query so temperatures and other quantities cannot select them.
        const pattern = [...key].map(char => char.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')).join('[\\s_-]*');
        const embedded = /[A-Z]/u.test(key) && new RegExp(`(?<![\\p{L}\\p{N}_-])${pattern}(?![\\p{L}\\p{N}_-])`, 'iu').test(query);
        if (key !== queryKey && !embedded) continue;
        const existing = matches.get(product.productId);
        if (existing) {
          existing.matchedFields.add(field);
        } else {
          matches.set(product.productId, {
            productId: product.productId,
            model: product.model,
            matchedField: field,
            matchedFields: new Set([field]),
          });
        }
      }
    }

    if (matches.size !== 1) return null;
    const match = [...matches.values()][0]!;
    return {
      productId: match.productId,
      model: match.model,
      matchedField: match.matchedFields.has('product_id')
        ? 'product_id'
        : 'model',
    };
  }

  private identityKey(value: string): string {
    return value
      .normalize('NFC')
      .trim()
      .toLocaleUpperCase('en-US')
      .replace(/\s+/gu, '')
      .replace(/[-_]/gu, '');
  }

  private parseProtocols(query: string): ParsedTechnicalProtocol[] {
    const normalized = query
      .normalize('NFC')
      .replace(/[‐‑–—]/gu, '-')
      .toLocaleLowerCase('en-US')
      // An unavailable transport describes the site, not a requested product feature.
      .replace(/\b(?:wi[\s-]?fi|rs[\s-]?(?:232|485)|sdi[\s-]?12|usb|canbus|cpi)\s+(?:is\s+)?(?:unavailable|not available)\b/giu, '');
    const protocols: ParsedTechnicalProtocol[] = [];
    if (/\bsdi[\s-]?12\b/iu.test(normalized)) protocols.push('SDI-12');
    if (/\brs[\s-]?485\b/iu.test(normalized)) protocols.push('RS-485');
    if (/\brs[\s-]?232\b/iu.test(normalized)) protocols.push('RS-232');
    if (/\busb\b/iu.test(normalized)) protocols.push('USB');
    if (/\bcan[\s-]?bus\b/iu.test(normalized)) protocols.push('CANbus');
    if (/\bcpi\b/iu.test(normalized)) protocols.push('CPI');
    if (/\bwi[\s-]?fi\b/iu.test(normalized)) protocols.push('Wi-Fi');
    if (/\bmodbus\s+rtu\b/iu.test(normalized)) {
      protocols.push('Modbus RTU');
    } else if (!/\bmodbus\s+(?:ascii|tcp)\b/iu.test(normalized)) {
      if (/\bmodbus\b/iu.test(normalized)) protocols.push('Modbus');
    }
    return protocols;
  }

  private parseTemperature(query: string): TemperatureConstraint[] {
    const range = RANGE_PATTERN.exec(query);
    if (range) {
      const minCelsius = this.parseNumber(range[1]!);
      const maxCelsius = this.parseNumber(range[2]!);
      if (minCelsius > maxCelsius) return [];
      const intent = this.temperatureIntent(query, 'range');
      return [
        {
          kind: 'range',
          intent,
          minCelsius,
          maxCelsius,
          unit: CELSIUS_UNIT,
          confidence: intent === 'ambiguous' ? 'none' : 'high',
        },
      ];
    }

    const point = POINT_PATTERN.exec(query);
    if (!point) return [];
    const valueCelsius = this.parseNumber(point[1]!);
    const intent = this.temperatureIntent(query, 'point');
    if (intent === 'measurement') {
      return [
        {
          kind: 'upper_bound',
          intent,
          valueCelsius,
          unit: CELSIUS_UNIT,
          confidence: 'high',
        },
      ];
    }
    return [
      {
        kind: 'point',
        intent,
        valueCelsius,
        unit: CELSIUS_UNIT,
        confidence: intent === 'ambiguous' ? 'none' : 'high',
      },
    ];
  }

  private temperatureIntent(
    query: string,
    kind: 'point' | 'range',
  ): TemperatureIntent {
    const normalized = query.normalize('NFC').toLocaleLowerCase('en-US');
    const measurement =
      /\bmeasure(?:s|d|ment|ments|ing)?\s+up\s+to\b/iu.test(normalized) ||
      /(?:^|[^\p{L}\p{N}])đo\s+(?:tới|đến)(?=$|[^\p{L}\p{N}])/iu.test(
        normalized,
      );
    if (measurement) return 'measurement';

    const operating =
      /\boperat(?:e|es|ing)\b/iu.test(normalized) ||
      /\boperating\s+temperature\b/iu.test(normalized) ||
      /(?:^|[^\p{L}\p{N}])hoạt\s+động\s+(?:ở|tại)(?=$|[^\p{L}\p{N}])/iu.test(
        normalized,
      ) ||
      /(?:^|[^\p{L}\p{N}])nhiệt\s+độ\s+hoạt\s+động(?=$|[^\p{L}\p{N}])/iu.test(
        normalized,
      );
    if (operating) return 'operating';

    if (kind === 'range') return 'ambiguous';
    return 'ambiguous';
  }

  private parseNumber(value: string): number {
    return Number(value.replace('−', '-'));
  }
}
