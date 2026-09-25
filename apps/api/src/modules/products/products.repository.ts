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

  async update(
    productIdOrModel: string,
    updates: Partial<ProductRow>,
  ): Promise<ProductRow | null> {
    const product = await this.findByIdOrModel(productIdOrModel, false);
    if (!product) return null;

    const { data, error } = await this.supabase
      .getClient()
      .from('products')
      .update(updates)
      .eq('product_id', product.product_id)
      .select(productColumns)
      .maybeSingle();

    if (error) this.throwQueryError('update product', error);
    return data as ProductRow | null;
  }

  async updateDocument(
    productId: string,
    documentUpdates: {
      name_vi?: string | null;
      supported_protocols?: string[];
      category?: string | null;
      subcategory?: string | null;
      device_type?: string | null;
    },
  ): Promise<void> {
    const documents = await this.listDocuments([productId]);
    const existingDoc = documents[0]?.search_document;
    if (!existingDoc) return;

    const updatedDoc = { ...existingDoc };
    if (documentUpdates.name_vi !== undefined) {
      updatedDoc.name_vi = documentUpdates.name_vi;
    }
    if (documentUpdates.supported_protocols !== undefined) {
      updatedDoc.supported_protocols = documentUpdates.supported_protocols;
    }
    if (updatedDoc.taxonomy) {
      if (documentUpdates.category !== undefined && documentUpdates.category !== null) {
        updatedDoc.taxonomy.category = documentUpdates.category;
      }
      if (documentUpdates.subcategory !== undefined && documentUpdates.subcategory !== null) {
        updatedDoc.taxonomy.subcategory = documentUpdates.subcategory;
      }
      if (documentUpdates.device_type !== undefined && documentUpdates.device_type !== null) {
        updatedDoc.taxonomy.device_type = documentUpdates.device_type;
      }
    }

    const { error } = await this.supabase
      .getClient()
      .from('product_documents')
      .update({ search_document: updatedDoc })
      .eq('product_id', productId);

    if (error) this.logger.warn(`Failed to update product document for ${productId}: ${error.message}`);
  }

  async updateMediaUrl(productId: string, productUrl: string): Promise<void> {
    const media = await this.listMedia([productId]);
    const targetMedia = media[0];
    if (targetMedia && targetMedia.media_id) {
      const { error } = await this.supabase
        .getClient()
        .from('product_media')
        .update({ product_url: productUrl })
        .eq('media_id', targetMedia.media_id);
      if (error) this.logger.warn(`Failed to update product_media for ${productId}: ${error.message}`);
    } else if (productUrl) {
      const { error } = await this.supabase
        .getClient()
        .from('product_media')
        .insert({
          product_id: productId,
          media_type: 'web_page',
          product_url: productUrl,
          position: 1,
        });
      if (error) this.logger.warn(`Failed to insert product_media for ${productId}: ${error.message}`);
    }
  }

  async updateSpecifications(
    productId: string,
    specifications: Array<{ canonical_key: string; value: string }>,
  ): Promise<void> {
    for (const spec of specifications) {
      const normalized = this.parseNormalizedValue(spec.value);
      const { error } = await this.supabase
        .getClient()
        .from('product_specifications')
        .update({
          raw_ref: { raw_value: spec.value },
          normalized_value: normalized,
        })
        .eq('product_id', productId)
        .eq('canonical_key', spec.canonical_key);

      if (error) this.logger.warn(`Failed to update specification ${spec.canonical_key}: ${error.message}`);
    }
  }

  private parseNormalizedValue(valStr: string) {
    if (!valStr || !valStr.trim()) {
      return { type: 'string', value: '' };
    }
    const str = valStr.trim();

    // Check range pattern e.g. "-5 – 95 °C" or "-50 - 100 °C" or "0 - 10"
    const rangeMatch = str.match(/^([+-]?\d+(?:\.\d+)?)\s*[\u2013\u2014-]\s*([+-]?\d+(?:\.\d+)?)\s*(.*)$/);
    if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
      return {
        type: 'range',
        min_value: parseFloat(rangeMatch[1]),
        max_value: parseFloat(rangeMatch[2]),
        unit: rangeMatch[3] ? rangeMatch[3].trim() : '',
      };
    }

    // Check number / quantity pattern e.g. "305 m" or "0.957"
    const numMatch = str.match(/^([+-]?\d+(?:\.\d+)?)\s*(.*)$/);
    if (numMatch && numMatch[1]) {
      const val = parseFloat(numMatch[1]);
      const unit = numMatch[2] ? numMatch[2].trim() : '';
      if (unit) {
        return { type: 'quantity', value: val, unit };
      }
      return { type: 'number', value: val };
    }

    if (str.toLowerCase() === 'true' || str.toLowerCase() === 'yes') {
      return { type: 'boolean', value: true };
    }
    if (str.toLowerCase() === 'false' || str.toLowerCase() === 'no') {
      return { type: 'boolean', value: false };
    }

    return { type: 'string', value: str };
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
  ): Promise<ProductSpecificationRow[]> {
    if (productIds.length === 0) return [];
    const { data, error } = await this.supabase
      .getClient()
      .from('product_specifications')
      .select(
        'specification_id,product_id,canonical_key,quantity_kind,normalized_value,raw_ref',
      )
      .in('product_id', productIds)
      .neq('normalized_value->>type', 'text')
      .order('product_id', { ascending: true })
      .order('specification_id', { ascending: true });
    if (error) this.throwQueryError('load product specifications by id', error);
    return (data ?? []) as ProductSpecificationRow[];
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
