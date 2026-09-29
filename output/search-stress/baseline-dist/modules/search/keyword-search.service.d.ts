import { SupabaseService } from '../../database/supabase/supabase.service';
export interface KeywordSearchRow {
    product_id: string;
    model: string;
    product_name_en: string;
    search_text: string;
    rank: number;
}
export declare class KeywordSearchService {
    private readonly supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    search(query: string, limit: number): Promise<KeywordSearchRow[]>;
    private throwQueryError;
}
