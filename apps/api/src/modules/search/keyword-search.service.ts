import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../database/supabase/supabase.service';
import { ProductsService } from '../products/products.service';
import { specificationTerms, specificationEvidence } from './specification-query';
import { suggestModels } from './model-suggestions';

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

  async search(query: string, limit: number): Promise<KeywordSearchRow[]> {
    const { data, error } = await this.supabase
      .getClient()
      .rpc('search_products_keyword', {
        query_text: query,
        result_limit: limit,
      });
    if (error) this.throwQueryError(error);
    const rows = (data ?? []) as KeywordSearchRow[];
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
      const { data: specs, error: specError } = await this.supabase.getClient()
        .from('product_specifications').select('product_id')
        .ilike('normalized_value->>value_raw', `%${literal}%`)
        .order('specification_id', { ascending: true }).range(offset, offset + 499);
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
