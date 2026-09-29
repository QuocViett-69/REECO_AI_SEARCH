import { type SearchRequest, type SearchResponse } from '@reeco/shared';
import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(request: SearchRequest): Promise<SearchResponse>;
}
