import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../database/supabase/supabase.service';

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

  constructor(private readonly supabase: SupabaseService) {}

  async search(query: string, limit: number): Promise<KeywordSearchRow[]> {
    const { data, error } = await this.supabase
      .getClient()
      .rpc('search_products_keyword', {
        query_text: query,
        result_limit: limit,
      });
    if (error) this.throwQueryError(error);
    return (data ?? []) as KeywordSearchRow[];
  }

  private throwQueryError(error: PostgrestError): never {
    this.logger.error(`keyword search failed: ${error.message}`);
    throw new ServiceUnavailableException(
      'Keyword search is temporarily unavailable',
    );
  }
}
