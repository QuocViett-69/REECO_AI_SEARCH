import { Injectable } from '@nestjs/common';
import type { ProductSpecification, ProductSearchDocument } from '@reeco/shared';
import { ProductsService } from '../products/products.service';
import { specificationEvidence } from './specification-query';
import { protocolSatisfies } from './protocol-query';
import { celsiusValue } from './unit-query';
import {
  CELSIUS_UNIT,
  MEASUREMENT_TEMPERATURE_KEYS,
  OPERATING_TEMPERATURE_KEYS,
} from './technical-query.constants';
import type {
  ParsedTechnicalProtocol,
  ParsedTechnicalQuery,
  TemperatureConstraint,
} from './technical-query-parser.service';

export type TechnicalEvaluation = 'MATCH' | 'MISMATCH' | 'UNKNOWN';

export interface IdentityMatchEvidence {
  source: 'products';
  field: 'product_id' | 'model';
  value: string;
}

export interface ProtocolMatchEvidence {
  source: 'product_document' | 'normalized_spec';
  canonicalProtocol: string;
  relation: 'supported' | 'unsupported';
  canonicalKey?: string;
  value?: string;
}

export interface ProtocolMatchEvaluation {
  queryProtocol: ParsedTechnicalProtocol;
  result: TechnicalEvaluation;
  evidence: ProtocolMatchEvidence[];
}

export interface TemperatureMatchEvidence {
  source: 'normalized_spec';
  canonicalKey: string;
  candidateRange: {
    minCelsius: number;
    maxCelsius: number;
    unit: typeof CELSIUS_UNIT;
  } | null;
  result: TechnicalEvaluation;
  rawRef: ProductSpecification['raw_ref'];
}

export interface TemperatureMatchEvaluation {
  constraint: TemperatureConstraint;
  result: TechnicalEvaluation;
  evidence: TemperatureMatchEvidence[];
}

export interface TechnicalMatchResult {
  productId: string;
  identityMatch: 'exact' | 'none';
  identityEvidence: IdentityMatchEvidence[];
  protocolMatches: ProtocolMatchEvaluation[];
  temperatureMatches: TemperatureMatchEvaluation[];
  hardMismatch: boolean;
}

const operatingTemperatureKeys = new Set<string>(OPERATING_TEMPERATURE_KEYS);
const measurementTemperatureKeys = new Set<string>(
  MEASUREMENT_TEMPERATURE_KEYS,
);

@Injectable()
export class TechnicalMatchService {
  constructor(private readonly productsService: ProductsService) {}

  async evaluate(
    parsedQuery: ParsedTechnicalQuery,
    candidateProductIds: string[],
  ): Promise<TechnicalMatchResult[]> {
    const evidenceById =
      await this.productsService.getTechnicalEvidenceByIds(candidateProductIds);

    return candidateProductIds.map((productId) => {
      const evidence = evidenceById.get(productId);
      const identity =
        evidence && parsedQuery.identity?.productId === productId
          ? this.identityEvidence(parsedQuery, evidence.product)
          : [];
      const protocolMatches = parsedQuery.protocols.map((protocol) =>
        this.evaluateProtocol(protocol, evidence?.document ?? null, evidence?.specifications ?? []),
      );
      const temperatureMatches = parsedQuery.temperatureConstraints.map(
        (constraint) =>
          evaluateTemperature(constraint, evidence?.specifications ?? []),
      );

      return {
        productId,
        identityMatch: identity.length > 0 ? 'exact' : 'none',
        identityEvidence: identity,
        protocolMatches,
        temperatureMatches,
        hardMismatch: temperatureMatches.some(
          (match) => match.result === 'MISMATCH',
        ),
      };
    });
  }

  private identityEvidence(
    parsedQuery: ParsedTechnicalQuery,
    product: { product_id: string; model: string },
  ): IdentityMatchEvidence[] {
    const identity = parsedQuery.identity;
    if (!identity || identity.productId !== product.product_id) return [];
    return [
      {
        source: 'products',
        field: identity.matchedField,
        value:
          identity.matchedField === 'product_id'
            ? product.product_id
            : product.model,
      },
    ];
  }

  private evaluateProtocol(
    queryProtocol: ParsedTechnicalProtocol,
    document: {
      supported_protocols: string[];
      unsupported_protocols: string[];
      model?: string;
      variants?: ProductSearchDocument['variants'];
    } | null,
    specifications: ProductSpecification[] = [],
  ): ProtocolMatchEvaluation {
    if (!document) {
      return { queryProtocol, result: 'UNKNOWN', evidence: [] };
    }

    // Family-wide wireless compatibility does not establish the selected communication option.
    const selected = document.variants?.find(variant => variant.model === document.model);
    const option = selected?.distinguishing_specifications.find(spec => spec.name_en === 'Communication Option');
    if (queryProtocol === 'Wi-Fi' && option && !/^wi[\s-]?fi$/iu.test(option.value_raw)) {
      return { queryProtocol, result: 'UNKNOWN', evidence: [] };
    }

    const supported = document.supported_protocols.find((protocol) =>
      protocolSatisfies(queryProtocol, protocol),
    );
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

    const unsupported = document.unsupported_protocols.find((protocol) =>
      protocolSatisfies(queryProtocol, protocol),
    );
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

    if (queryProtocol === 'CANbus') {
      const spec = specificationEvidence(['canbus'], specifications)?.[0];
      if (spec) return { queryProtocol, result: 'MATCH', evidence: [{ source: 'normalized_spec',
        canonicalProtocol: queryProtocol, relation: 'supported', canonicalKey: spec.canonical_key,
        value: spec.normalized_value.value_raw }] };
    }

    return { queryProtocol, result: 'UNKNOWN', evidence: [] };
  }

}

export function evaluateTemperature(
  constraint: TemperatureConstraint,
  specifications: ProductSpecification[],
): TemperatureMatchEvaluation {
  if (constraint.confidence !== 'high' || constraint.intent === 'ambiguous') {
    return { constraint, result: 'UNKNOWN', evidence: [] };
  }

  const approvedKeys =
    constraint.intent === 'operating'
      ? operatingTemperatureKeys
      : measurementTemperatureKeys;
  const relevant = specifications.filter((specification) =>
    approvedKeys.has(specification.canonical_key),
  );
  if (relevant.length === 0) {
    return { constraint, result: 'UNKNOWN', evidence: [] };
  }

  const evidence = relevant.map((specification) =>
    evaluateTemperatureSpecification(constraint, specification),
  );
  const result = evidence.some((item) => item.result === 'MATCH')
    ? 'MATCH'
    : evidence.every((item) => item.result === 'MISMATCH')
      ? 'MISMATCH'
      : 'UNKNOWN';
  return { constraint, result, evidence };
}

function evaluateTemperatureSpecification(
  constraint: TemperatureConstraint,
  specification: ProductSpecification,
): TemperatureMatchEvidence {
  const normalized = specification.normalized_value;
  if (
    normalized.type !== 'range' ||
    normalized.min_value === undefined ||
    normalized.max_value === undefined ||
    !normalized.unit || !/^(?:°[CF]|℃|℉|K|Kelvin|Celsius|Fahrenheit)$/iu.test(normalized.unit)
  ) {
    return {
      source: 'normalized_spec',
      canonicalKey: specification.canonical_key,
      candidateRange: null,
      result: 'UNKNOWN',
      rawRef: specification.raw_ref,
    };
  }

  const candidateRange = {
    minCelsius: celsiusValue(String(normalized.min_value), normalized.unit)!,
    maxCelsius: celsiusValue(String(normalized.max_value), normalized.unit)!,
    unit: CELSIUS_UNIT,
  } as const;
  let matches: boolean;
  if (constraint.kind === 'range') {
    matches =
      candidateRange.minCelsius <= constraint.minCelsius &&
      candidateRange.maxCelsius >= constraint.maxCelsius;
  } else if (constraint.kind === 'upper_bound') {
    matches = candidateRange.minCelsius <= constraint.valueCelsius && candidateRange.maxCelsius >= constraint.valueCelsius;
  } else {
    matches =
      candidateRange.minCelsius <= constraint.valueCelsius &&
      candidateRange.maxCelsius >= constraint.valueCelsius;
  }

  return {
    source: 'normalized_spec',
    canonicalKey: specification.canonical_key,
    candidateRange,
    result: matches ? 'MATCH' : 'MISMATCH',
    rawRef: specification.raw_ref,
  };
}
