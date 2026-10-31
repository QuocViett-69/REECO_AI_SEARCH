import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../database/supabase/supabase.service';
import { ProductsService } from '../products/products.service';
import { specificationTerms, specificationEvidence, specificationConstraints, matchSpecificationConstraints } from './specification-query';
import { suggestModels } from './model-suggestions';
import type { ProductSpecification } from '@reeco/shared';
import { TechnicalQueryParserService } from './technical-query-parser.service';
import { OPERATING_TEMPERATURE_KEYS, MEASUREMENT_TEMPERATURE_KEYS } from './technical-query.constants';
import { evaluateTemperature } from './technical-match.service';
import { parseSearchIntent } from './search-intent';

export interface KeywordSearchRow {
  product_id: string;
  model: string;
  product_name_en: string;
  search_text: string;
  rank: number;
}

@Injectable()
export class KeywordSearchService {
  private readonly logger = new Logger(KeywordSearchService.name);

  constructor(private readonly supabase: SupabaseService, private readonly products: ProductsService) {}

  async search(query: string, limit: number, signal?: AbortSignal): Promise<KeywordSearchRow[]> {
    const request = this.supabase
      .getClient()
      .rpc('search_products_keyword', {
        query_text: query,
        result_limit: limit,
      });
    const { data, error } = await (signal ? request.abortSignal(signal) : request);
    if (error) this.throwQueryError(error);
    let rows = (data ?? []) as KeywordSearchRow[];
    const temperatures = new TechnicalQueryParserService().parse(query).temperatureConstraints
      .filter(constraint => constraint.confidence === 'high' && constraint.intent !== 'ambiguous');
    const constraints = specificationConstraints(query);
    if (temperatures.length || constraints.length) {
      const keys = [...new Set(temperatures.flatMap(constraint => constraint.intent === 'operating'
        ? [...OPERATING_TEMPERATURE_KEYS] : [...MEASUREMENT_TEMPERATURE_KEYS]))];
      const specifications = new Map<string, ProductSpecification[]>();
      for (let offset = 0; ; offset += 500) {
        let request = this.supabase.getClient().from('product_specifications')
          .select('product_id,specification_id,canonical_key,quantity_kind,normalized_value,raw_ref');
        if (constraints.length) {
          const filters = [...new Set(constraints.flatMap(item => item.field.hints))].map(hint => `canonical_key.ilike.%${hint}%`);
          if (keys.length) filters.push(`canonical_key.in.(${keys.join(',')})`);
          request = request.or(filters.join(','));
        } else request = request.in('canonical_key', keys);
        const pageRequest = request.order('specification_id', { ascending: true }).range(offset, offset + 499);
        const { data, error } = await (signal ? pageRequest.abortSignal(signal) : pageRequest);
        if (error) this.throwQueryError(error);
        const page = (data ?? []) as (ProductSpecification & { product_id: string })[];
        for (const spec of page) {
          const group = specifications.get(spec.product_id) ?? [];
          group.push(spec);
          specifications.set(spec.product_id, group);
        }
        if (page.length < 500) break;
      }
      const matches = new Map<string, number>();
      for (const [id, specs] of specifications) {
        const evaluated = temperatures.map(constraint => evaluateTemperature(constraint, specs));
        const technical = matchSpecificationConstraints(constraints, specs);
        if (!evaluated.every(match => match.result === 'MATCH') || !technical) continue;
        matches.set(id, evaluated.filter(match => match.constraint.kind === 'range'
          && match.evidence.some(evidence => match.constraint.kind === 'range'
            && evidence.candidateRange?.minCelsius === match.constraint.minCelsius
            && evidence.candidateRange.maxCelsius === match.constraint.maxCelsius)).length + technical.filter(match => match.exact).length);
      }
      const summaries = await this.products.getPublicSummariesByIds([...matches.keys()]);
      const lexicalOrder = new Map(rows.map((row, index) => [row.product_id, index]));
      const numericRows = [...matches].sort((a, b) => b[1] - a[1]
        || (lexicalOrder.get(a[0]) ?? Infinity) - (lexicalOrder.get(b[0]) ?? Infinity)).flatMap(([id]) => {
        const product = summaries.get(id);
        return product ? [{ product_id: id, model: product.model, product_name_en: product.name_en, search_text: '', rank: 0 }] : [];
      });
      const ids = new Set(numericRows.map(row => row.product_id));
      rows = [...numericRows, ...rows.filter(row => !ids.has(row.product_id))].slice(0, limit);
    }
    if (rows.length < limit) {
      const intent = parseSearchIntent(query);
      const roleTerms: Record<string, string[]> = {
        weather: ['weather'], communication: ['communication', 'modem', 'radio', 'transmitter'],
        cellular: ['cellular'],
      };
      const terms = [...intent.measurements.map(item => item.en),
        ...intent.roles.flatMap(item => roleTerms[item.key] ?? [item.en]),
        ...(intent.target ? [intent.target.en] : []), ...(intent.transport ? [intent.transport] : [])];
      const expanded = [...new Set(terms.map(term => `"${term}"`))].join(' OR ');
      if (expanded && expanded !== `"${query.trim().toLowerCase()}"`) {
        // Fill sparse lexical retrieval with canonical concepts; public filters still enforce every requirement.
        const expandedRequest = this.supabase.getClient().rpc('search_products_keyword', {
          query_text: expanded, result_limit: limit,
        });
        const fallback = await (signal ? expandedRequest.abortSignal(signal) : expandedRequest);
        if (fallback.error && !rows.length) this.throwQueryError(fallback.error);
        const ids = new Set(rows.map(row => row.product_id));
        rows = [...rows, ...((fallback.data ?? []) as KeywordSearchRow[]).filter(row => !ids.has(row.product_id))].slice(0, limit);
      }
    }
    const terms = specificationTerms(query);
    if (terms.length === 0) {
      if (!/^[a-z0-9\s_-]{4,40}$/iu.test(query)) return rows;
      const suggestions = suggestModels(query, await this.products.getActiveTechnicalIdentityCatalog());
      if (!suggestions.length) return rows;
      const summaries = await this.products.getPublicSummariesByIds(suggestions.map(p => p.productId));
      const matches = suggestions.flatMap(p => {
        const summary = summaries.get(p.productId);
        return summary ? [{ product_id: p.productId, model: summary.model, product_name_en: summary.name_en, search_text: '', rank: 0 }] : [];
      });
      const ids = new Set(matches.map(r => r.product_id));
      return [...matches, ...rows.filter(r => !ids.has(r.product_id))].slice(0, limit);
    }
    // The search document omits many raw specifications. Retrieve their literal hits
    // before fusion so a semantic miss cannot hide an exact technical value.
    const literal = terms[0]!.split(' ')[0]!.replace(/[\\%_]/gu, '\\$&');
    const ids = new Set<string>();
    for (let offset = 0; ; offset += 500) {
      const specRequest = this.supabase.getClient()
        .from('product_specifications').select('product_id')
        .ilike('normalized_value->>value_raw', `%${literal}%`)
        .order('specification_id', { ascending: true }).range(offset, offset + 499);
      const { data: specs, error: specError } = await (signal ? specRequest.abortSignal(signal) : specRequest);
      if (specError) this.throwQueryError(specError);
      for (const spec of specs ?? []) ids.add(spec.product_id as string);
      if ((specs?.length ?? 0) < 500) break;
    }
    const evidence = await this.products.getTechnicalEvidenceByIds([...ids]);
    const exact = [...evidence.values()].filter(item => specificationEvidence(terms, item.specifications));
    const literalRows = exact.map(item => ({ product_id: item.product.product_id,
      model: item.product.model, product_name_en: item.product.product_name_en,
      search_text: item.document?.search_text ?? '', rank: rows.find(row => row.product_id === item.product.product_id)?.rank ?? 0 }));
    const matched = new Set(literalRows.map(row => row.product_id));
    return [...literalRows, ...rows.filter(row => !matched.has(row.product_id))].slice(0, limit);
  }

  private throwQueryError(error: PostgrestError): never {
    this.logger.error(`keyword search failed: ${error.message}`);
    throw new ServiceUnavailableException(
      'Keyword search is temporarily unavailable',
    );
  }
}
