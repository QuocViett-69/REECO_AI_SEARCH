import { type ProductDetail, type ProductListQuery, type ProductListResponse, type ProductSearchDocument, type ProductSpecification, type ProductStatus, type ProductSummary } from '@reeco/shared';
import { ProductsRepository, type ProductRow } from './products.repository';
export interface ProductTechnicalEvidence {
    product: ProductRow;
    document: ProductSearchDocument | null;
    specifications: ProductSpecification[];
}
export interface ProductTechnicalIdentity {
    productId: string;
    model: string;
}
export declare class ProductsService {
    private readonly productsRepository;
    constructor(productsRepository: ProductsRepository);
    listPublic(query: ProductListQuery): Promise<ProductListResponse>;
    listAdmin(query: ProductListQuery): Promise<ProductListResponse>;
    getPublic(productId: string): Promise<ProductDetail>;
    getAdmin(productId: string): Promise<ProductDetail>;
    updateAdmin(productId: string, updates: {
        product_name_en?: string;
        name_vi?: string | null;
        category?: string | null;
        subcategory?: string | null;
        device_type?: string | null;
        status?: ProductStatus;
        product_url?: string;
        supported_protocols?: string[];
        specifications?: Array<{
            canonical_key: string;
            value: string;
        }>;
    }): Promise<ProductDetail>;
    getPublicSummariesByIds(productIds: string[]): Promise<Map<string, ProductSummary>>;
    getActiveTechnicalIdentityCatalog(): Promise<ProductTechnicalIdentity[]>;
    getSearchDocumentsByIds(productIds: string[]): Promise<Map<string, ProductSearchDocument>>;
    getTechnicalEvidenceByIds(productIds: string[]): Promise<Map<string, ProductTechnicalEvidence>>;
    getEnvironmentalSpecificationsByIds(productIds: string[]): Promise<Map<string, ProductSpecification[]>>;
    private list;
    private getDetail;
    private toSummary;
    private groupSpecifications;
}
