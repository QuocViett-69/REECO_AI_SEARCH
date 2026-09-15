import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  SearchResponseSchema,
  type SearchRequest,
  type SearchResponse,
} from '@reeco/shared';
import { ProductsService } from '../products/products.service';
import { KeywordSearchService } from './keyword-search.service';

@Injectable()
export class SearchService {
  constructor(
    private readonly keywordSearch: KeywordSearchService,
    private readonly productsService: ProductsService,
  ) {}

  async search(request: SearchRequest): Promise<SearchResponse> {
    const keywordResults = await this.keywordSearch.search(
      request.query,
      request.limit,
    );
    const summaries = await this.productsService.getPublicSummariesByIds(
      keywordResults.map((result) => result.product_id),
    );

    const results = keywordResults.map((result) => {
      const product = summaries.get(result.product_id);
      if (!product) {
        throw new ServiceUnavailableException(
          'Search returned a product that is not publicly available',
        );
      }
      return {
        product_id: product.product_id,
        model: product.model,
        name_en: product.name_en,
        name_vi: product.name_vi,
        category: product.category,
        device_type: product.device_type,
        image_url: product.image_url,
        matched_features: [],
        scores: {
          keyword: Number(result.rank),
          semantic: null,
          hybrid: null,
          rerank: null,
        },
      };
    });

    return SearchResponseSchema.parse({
      query: request.query,
      mode: 'keyword',
      results,
    });
  }
}
