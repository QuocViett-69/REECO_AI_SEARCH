import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  SearchRequestSchema,
  type SearchRequest,
  type SearchResponse,
} from '@reeco/shared';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  search(
    @Body(new ZodValidationPipe(SearchRequestSchema)) request: SearchRequest,
  ): Promise<SearchResponse> {
    return this.searchService.search(request);
  }
}
