import type { ProductMedia, ProductSearchDocument, ProductSpecification, ProductStatus } from '@reeco/shared';
import { SupabaseService } from '../../database/supabase/supabase.service';
export interface ProductRow {
    product_id: string;
    model: string;
    product_name_en: string;
    category: string | null;
    subcategory: string | null;
    device_type: string | null;
    status: ProductStatus;
}
export interface ProductIdentityRow {
    product_id: string;
    model: string;
}
export interface ProductDocumentRow {
    product_id: string;
    search_document: ProductSearchDocument;
}
export interface ProductSpecificationRow extends ProductSpecification {
    product_id: string;
}
export interface ProductRepositoryFilters {
    category?: string;
    subcategory?: string;
    device_type?: string;
}
export declare class ProductsRepository {
    private readonly supabase;
    private readonly logger;
    constructor(supabase: SupabaseService);
    list(filters: ProductRepositoryFilters, activeOnly: boolean): Promise<ProductRow[]>;
    listByIds(productIds: string[], activeOnly: boolean): Promise<ProductRow[]>;
    listActiveIdentityCatalog(): Promise<ProductIdentityRow[]>;
    findByIdOrModel(productIdOrModel: string, activeOnly: boolean): Promise<ProductRow | null>;
    update(productIdOrModel: string, updates: Partial<ProductRow>): Promise<ProductRow | null>;
    updateDocument(productId: string, documentUpdates: {
        name_vi?: string | null;
        supported_protocols?: string[];
        category?: string | null;
        subcategory?: string | null;
        device_type?: string | null;
    }): Promise<void>;
    updateMediaUrl(productId: string, productUrl: string): Promise<void>;
    updateSpecifications(productId: string, specifications: Array<{
        canonical_key: string;
        value: string;
    }>): Promise<void>;
    private parseNormalizedValue;
    listDocuments(productIds: string[]): Promise<ProductDocumentRow[]>;
    listSpecifications(productId: string): Promise<ProductSpecification[]>;
    listSpecificationsByProductIds(productIds: string[], canonicalKeys?: string[]): Promise<ProductSpecificationRow[]>;
    listMedia(productIds: string[]): Promise<Array<ProductMedia & {
        product_id: string;
    }>>;
    private findOne;
    private throwQueryError;
}
