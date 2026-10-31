import { Injectable, Logger } from '@nestjs/common';
import type { ProductSearchDocument } from '@reeco/shared';
import { configuration } from '../../config/configuration';
import { ProductsService } from '../products/products.service';
import type { ParsedTechnicalQuery } from './technical-query-parser.service';
import type { TechnicalRankedCandidate } from './technical-ranking.service';

interface RerankerResult {
  product_id: string;
  score: number;
}

interface RerankerResponse {
  results: RerankerResult[];
  model: string;
  revision: string;
  latency_ms: number;
}

interface SerializedCandidate {
  product_id: string;
  document: string;
}

const uniqueLabels = (
  items: ProductSearchDocument['measurements'],
): string =>
  [
    ...new Set(
      items.flatMap((item) => [item.label_en, item.label_vi]).filter(Boolean),
    ),
  ].join('; ');

export function serializeRerankerCandidate(
  document: ProductSearchDocument,
  parsed: ParsedTechnicalQuery,
  matchedFeatures: string[],
): string {
  const specifications =
    parsed.temperatureConstraints.length > 0
      ? document.important_specifications.filter(
          (item) =>
            item.quantity_kind === 'temperature' &&
            item.normalized_value.type === 'range',
        )
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
      .map(
        (item) =>
          `${item.canonical_key}=${JSON.stringify(item.normalized_value)}`,
      )
      .join('; ')}`,
    `Matched structured features: ${matchedFeatures.join('; ')}`,
  ].join('\n');
}

@Injectable()
export class RerankerService {
  private readonly logger = new Logger(RerankerService.name);
  private readonly config = configuration().reranker;

  constructor(private readonly productsService: ProductsService) {}

  async rerank(
    query: string,
    parsed: ParsedTechnicalQuery,
    baseline: TechnicalRankedCandidate[],
  ): Promise<TechnicalRankedCandidate[]> {
    if (!this.config.enabled || baseline.length < 2) return baseline;

    const prefix = baseline.slice(0, this.config.topN);
    const startedAt = performance.now();
    try {
      const candidates = await this.candidates(prefix, parsed);
      const response = await this.request(query, candidates);
      const orderedIds = this.validate(response, candidates);
      const exactIdentity = prefix.find(
        (candidate) => candidate.technical.exactIdentity,
      )?.candidate.productId;
      const protectedIds = exactIdentity
        ? [exactIdentity, ...orderedIds.filter((id) => id !== exactIdentity)]
        : orderedIds;
      const byId = new Map(
        prefix.map((candidate) => [candidate.candidate.productId, candidate]),
      );
      this.logTelemetry(
        true,
        null,
        performance.now() - startedAt,
        prefix.length,
      );
      return [
        ...protectedIds.map((id) => byId.get(id)!).sort((a, b) =>
          Number(b.technical.exactIdentity) - Number(a.technical.exactIdentity)
          || (b.technical.exactTemperatureRangeCount ?? 0) - (a.technical.exactTemperatureRangeCount ?? 0)),
        ...baseline.slice(prefix.length),
      ];
    } catch (error) {
      this.logTelemetry(
        false,
        this.failureReason(error),
        performance.now() - startedAt,
        prefix.length,
      );
      return baseline;
    }
  }

  private async candidates(
    prefix: TechnicalRankedCandidate[],
    parsed: ParsedTechnicalQuery,
  ): Promise<SerializedCandidate[]> {
    const ids = prefix.map((item) => item.candidate.productId);
    const documents = await this.productsService.getSearchDocumentsByIds(ids);
    return prefix.map((item) => {
      const document = documents.get(item.candidate.productId);
      if (!document) throw new Error('MISSING_DOCUMENT');
      return {
        product_id: item.candidate.productId,
        document: serializeRerankerCandidate(
          document,
          parsed,
          this.offlineMatchedFeatures(document, parsed),
        ),
      };
    });
  }

  private offlineMatchedFeatures(
    document: ProductSearchDocument,
    parsed: ParsedTechnicalQuery,
  ): string[] {
    const features: string[] = [];
    if (parsed.identity?.productId === document.product_id) {
      features.push(
        `identity:${parsed.identity.matchedField}:${parsed.identity.model}`,
      );
    }
    for (const protocol of parsed.protocols) {
      if (
        document.supported_protocols.some((supported) =>
          protocol === 'Modbus'
            ? supported === 'Modbus' || supported.startsWith('Modbus ')
            : supported === protocol,
        )
      ) {
        features.push(`protocol:${protocol}`);
      }
    }
    return features;
  }

  private async request(
    query: string,
    candidates: SerializedCandidate[],
  ): Promise<RerankerResponse> {
    const response = await fetch(`${this.config.baseUrl}/rerank`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, candidates }),
      signal: AbortSignal.timeout(this.config.timeoutMs),
    });
    if (!response.ok) throw new Error('HTTP_ERROR');
    return (await response.json()) as RerankerResponse;
  }

  private validate(
    response: RerankerResponse,
    candidates: SerializedCandidate[],
  ): string[] {
    if (
      !response ||
      response.model !== this.config.model ||
      response.revision !== this.config.revision ||
      !Number.isFinite(response.latency_ms) ||
      !Array.isArray(response.results)
    ) {
      throw new Error('MALFORMED_RESPONSE');
    }
    const allowed = new Set(candidates.map((candidate) => candidate.product_id));
    const ids = response.results.map((result) => result?.product_id);
    if (
      ids.length !== allowed.size ||
      new Set(ids).size !== ids.length ||
      ids.some((id) => !allowed.has(id)) ||
      response.results.some((result) => !Number.isFinite(result?.score))
    ) {
      throw new Error('INVALID_CANDIDATE_SET');
    }
    return ids;
  }

  private failureReason(error: unknown): string {
    if (error instanceof Error && error.name === 'TimeoutError') return 'timeout';
    if (error instanceof TypeError) return 'unavailable';
    if (error instanceof Error && error.message === 'INVALID_CANDIDATE_SET') {
      return 'invalid_candidate_set';
    }
    if (error instanceof Error && error.message === 'MISSING_DOCUMENT') {
      return 'missing_document';
    }
    return 'invalid_response';
  }

  private logTelemetry(
    success: boolean,
    fallbackReason: string | null,
    latencyMs: number,
    candidateCount: number,
  ): void {
    const payload = JSON.stringify({
      reranker_enabled: true,
      reranker_attempted: true,
      reranker_success: success,
      reranker_fallback_reason: fallbackReason,
      reranker_latency_ms: Number(latencyMs.toFixed(3)),
      reranker_candidate_count: candidateCount,
    });
    if (success) this.logger.debug(payload);
    else this.logger.warn(payload);
  }
}
