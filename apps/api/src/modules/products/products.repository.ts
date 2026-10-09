import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  ProductMedia,
  ProductSearchDocument,
  ProductSpecification,
  ProductStatus,
} from '@reeco/shared';
import type { PostgrestError } from '@supabase/supabase-js';
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

const productColumns =
  'product_id,model,product_name_en,category,subcategory,device_type,status';

@Injectable()
export class ProductsRepository {
  private readonly logger = new Logger(ProductsRepository.name);

  constructor(private readonly supabase: SupabaseService) {}

  async list(
    filters: ProductRepositoryFilters,
    activeOnly: boolean,
  ): Promise<ProductRow[]> {
    let query = this.supabase
      .getClient()
      .from('products')
      .select(productColumns)
      .order('model', { ascending: true });

    if (activeOnly) query = query.eq('status', 'active');
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.subcategory)
      query = query.eq('subcategory', filters.subcategory);
    if (filters.device_type)
      query = query.eq('device_type', filters.device_type);

    const { data, error } = await query;
    if (error) this.throwQueryError('list products', error);
    return (data ?? []) as ProductRow[];
  }

  async listByIds(
    productIds: string[],
    activeOnly: boolean,
  ): Promise<ProductRow[]> {
    if (productIds.length === 0) return [];

    let query = this.supabase
      .getClient()
      .from('products')
      .select(productColumns)
      .in('product_id', productIds);
    if (activeOnly) query = query.eq('status', 'active');

    const { data, error } = await query;
    if (error) this.throwQueryError('load products by id', error);
    return (data ?? []) as ProductRow[];
  }

  async listActiveIdentityCatalog(): Promise<ProductIdentityRow[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('products')
      .select('product_id,model')
      .eq('status', 'active')
      .order('product_id', { ascending: true });
    if (error) {
      this.throwQueryError('load active product identity catalog', error);
    }
    return (data ?? []) as ProductIdentityRow[];
  }

  async findByIdOrModel(
    productIdOrModel: string,
    activeOnly: boolean,
  ): Promise<ProductRow | null> {
    const byId = await this.findOne('product_id', productIdOrModel, activeOnly);
    if (byId) return byId;
    return this.findOne('model', productIdOrModel, activeOnly);
  }

  async listDocuments(productIds: string[]): Promise<ProductDocumentRow[]> {
    if (productIds.length === 0) return [];
    const { data, error } = await this.supabase
      .getClient()
      .from('product_documents')
      .select('product_id,search_document')
      .in('product_id', productIds);
    if (error) this.throwQueryError('load product documents', error);
    return (data ?? []) as ProductDocumentRow[];
  }

  async listSpecifications(productId: string): Promise<ProductSpecification[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from('product_specifications')
      .select(
        'specification_id,canonical_key,quantity_kind,normalized_value,raw_ref',
      )
      .eq('product_id', productId)
      .order('specification_id', { ascending: true });
    if (error) this.throwQueryError('load product specifications', error);
    return (data ?? []) as ProductSpecification[];
  }

  async listSpecificationsByProductIds(
    productIds: string[],
    canonicalKeys?: string[],
  ): Promise<ProductSpecificationRow[]> {
    if (productIds.length === 0) return [];
    const rows: ProductSpecificationRow[] = [];
    // PostgREST caps result sets; never silently drop evidence past the first page.
    for (let offset = 0; ; offset += 500) {
      let query = this.supabase
        .getClient()
        .from('product_specifications')
        .select(
          'specification_id,product_id,canonical_key,quantity_kind,normalized_value,raw_ref',
        )
        .in('product_id', productIds);
      if (canonicalKeys) query = query.in('canonical_key', canonicalKeys);
      const { data, error } = await query
        .order('product_id', { ascending: true })
        .order('specification_id', { ascending: true })
        .range(offset, offset + 499);
      if (error) this.throwQueryError('load product specifications by id', error);
      const page = (data ?? []) as ProductSpecificationRow[];
      rows.push(...page);
      if (page.length < 500) return rows;
    }
  }

  async listMedia(
    productIds: string[],
  ): Promise<Array<ProductMedia & { product_id: string }>> {
    if (productIds.length === 0) return [];
    const { data, error } = await this.supabase
      .getClient()
      .from('product_media')
      .select(
        'media_id,product_id,media_type,image_url,product_url,position,metadata',
      )
      .in('product_id', productIds)
      .order('position', { ascending: true });
    if (error) this.throwQueryError('load product media', error);
    return (data ?? []) as Array<ProductMedia & { product_id: string }>;
  }

  private async findOne(
    column: 'product_id' | 'model',
    value: string,
    activeOnly: boolean,
  ): Promise<ProductRow | null> {
    let query = this.supabase
      .getClient()
      .from('products')
      .select(productColumns)
      .eq(column, value);
    if (activeOnly) query = query.eq('status', 'active');

    const { data, error } = await query.maybeSingle();
    if (error) this.throwQueryError('load product', error);
    return data as ProductRow | null;
  }

  private throwQueryError(operation: string, error: PostgrestError): never {
    this.logger.error(`${operation} failed: ${error.message}`);
    throw new ServiceUnavailableException(
      'The product database is temporarily unavailable',
    );
  }
}
