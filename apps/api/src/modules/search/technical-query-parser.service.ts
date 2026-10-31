import { Injectable } from '@nestjs/common';
import { purchaseQuery } from './query-context';
import { protocolRequirements, requestedProtocols } from './protocol-query';
import { celsiusValue } from './unit-query';
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

const NUMBER_PATTERN = String.raw`[+\-−]?\d+(?:[.,]\d+)?`;
const TEMPERATURE_UNIT = String.raw`(?:°\s*[CF]|℃|℉|độ\s*[CF]|deg(?:rees?)?\s*[CF]|Celsius|Fahrenheit|Kelvin|[CFK])`;
const RANGE_PATTERN = new RegExp(
  String.raw`(?<![\p{L}\p{N}.])(${NUMBER_PATTERN})\s*(${TEMPERATURE_UNIT})?\s*(?:to|\.\.\.|đến|tới|[-–—])\s*(${NUMBER_PATTERN})\s*(${TEMPERATURE_UNIT})(?![\p{L}\p{N}])`,
  'iu',
);
const POINT_PATTERN = new RegExp(
  String.raw`(?<![\p{L}\p{N}.])(${NUMBER_PATTERN})\s*(${TEMPERATURE_UNIT})(?![\p{L}\p{N}])`,
  'iu',
);

@Injectable()
export class TechnicalQueryParserService {
  parse(
    query: string,
    catalog: readonly TechnicalProductIdentity[] = [],
  ): ParsedTechnicalQuery {
    const originalQuery = protocolRequirements(purchaseQuery(query.normalize('NFC').trim())).query
      .replace(/âm\s+(\d+(?:[.,]\d+)?)\s*(độ\s*[CF]|°\s*[CF]|[CFK]\b)/giu, '-$1 $2');
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
    return requestedProtocols(query);
  }

  private parseTemperature(query: string): TemperatureConstraint[] {
    return query.split(/;|(?:\band\b|\bbut\b|và|nhưng)\s+(?=(?:operat|measure|hoạt động|nhiệt độ hoạt động|đo |dải đo))/iu)
      .flatMap(clause => this.parseTemperatureClause(clause));
  }

  private parseTemperatureClause(query: string): TemperatureConstraint[] {
    // "between X and Y" reads as "X to Y"; a bare "and" is not a range separator ("SDI-12 and 70°C")
    const range = RANGE_PATTERN.exec(
      query.replace(
        new RegExp(String.raw`(?:\bbetween|giữa)\s+(${NUMBER_PATTERN}\s*(?:${TEMPERATURE_UNIT})?)\s+(?:and|và)\s+`, 'giu'),
        '$1 to ',
      ),
    );
    if (range) {
      const minCelsius = celsiusValue(range[1]!, range[2] ?? range[4]!);
      const maxCelsius = celsiusValue(range[3]!, range[4]!);
      if (minCelsius === null || maxCelsius === null) return [];
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
    const valueCelsius = celsiusValue(point[1]!, point[2]!);
    if (valueCelsius === null) return [];
    const intent = this.temperatureIntent(query, 'point');
    if (intent === 'measurement' && /measure(?:s|ment|ing)?\s+up\s+to|đo\s+(?:tới|đến)/iu.test(query)) {
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
      /(?:measurement\s+(?:temperature\s+)?range|temperature\s+measurement|dải\s+đo|dải\s+nhiệt\s+độ\s+đo|đo\s+nhiệt\s+độ)/iu.test(normalized) ||
      /(?:^|[^\p{L}\p{N}])đo\s+(?:tới|đến)(?=$|[^\p{L}\p{N}])/iu.test(
        normalized,
      );
    if (measurement) return 'measurement';

    const operating =
      /\boperat(?:e|es|ing)\b/iu.test(normalized) ||
      /\boperating\s+temperature\b/iu.test(normalized) ||
      /chịu (?:lạnh|nhiệt)|cold resistant|withstand.*cold/iu.test(normalized) ||
      /(?:nhiệt\s+độ\s+(?:vận\s+hành|làm\s+việc)|dải\s+(?:hoạt\s+động|vận\s+hành))/iu.test(normalized) ||
      /(?:^|[^\p{L}\p{N}])ho(?:ạ|a)t\s+(?:độ|do)ng\s+(?:ở|tại|o|tai)(?=$|[^\p{L}\p{N}])/iu.test(
        normalized,
      ) ||
      /(?:^|[^\p{L}\p{N}])nhiệt\s+độ\s+hoạt\s+động(?=$|[^\p{L}\p{N}])/iu.test(
        normalized,
      );
    if (operating) return 'operating';

    if (kind === 'range') return 'ambiguous';
    return 'ambiguous';
  }

}
