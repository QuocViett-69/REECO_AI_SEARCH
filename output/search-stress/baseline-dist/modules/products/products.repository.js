"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ProductsRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsRepository = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../database/supabase/supabase.service");
const productColumns = 'product_id,model,product_name_en,category,subcategory,device_type,status';
let ProductsRepository = ProductsRepository_1 = class ProductsRepository {
    supabase;
    logger = new common_1.Logger(ProductsRepository_1.name);
    constructor(supabase) {
        this.supabase = supabase;
    }
    async list(filters, activeOnly) {
        let query = this.supabase
            .getClient()
            .from('products')
            .select(productColumns)
            .order('model', { ascending: true });
        if (activeOnly)
            query = query.eq('status', 'active');
        if (filters.category)
            query = query.eq('category', filters.category);
        if (filters.subcategory)
            query = query.eq('subcategory', filters.subcategory);
        if (filters.device_type)
            query = query.eq('device_type', filters.device_type);
        const { data, error } = await query;
        if (error)
            this.throwQueryError('list products', error);
        return (data ?? []);
    }
    async listByIds(productIds, activeOnly) {
        if (productIds.length === 0)
            return [];
        let query = this.supabase
            .getClient()
            .from('products')
            .select(productColumns)
            .in('product_id', productIds);
        if (activeOnly)
            query = query.eq('status', 'active');
        const { data, error } = await query;
        if (error)
            this.throwQueryError('load products by id', error);
        return (data ?? []);
    }
    async listActiveIdentityCatalog() {
        const { data, error } = await this.supabase
            .getClient()
            .from('products')
            .select('product_id,model')
            .eq('status', 'active')
            .order('product_id', { ascending: true });
        if (error) {
            this.throwQueryError('load active product identity catalog', error);
        }
        return (data ?? []);
    }
    async findByIdOrModel(productIdOrModel, activeOnly) {
        const byId = await this.findOne('product_id', productIdOrModel, activeOnly);
        if (byId)
            return byId;
        return this.findOne('model', productIdOrModel, activeOnly);
    }
    async update(productIdOrModel, updates) {
        const product = await this.findByIdOrModel(productIdOrModel, false);
        if (!product)
            return null;
        const { data, error } = await this.supabase
            .getClient()
            .from('products')
            .update(updates)
            .eq('product_id', product.product_id)
            .select(productColumns)
            .maybeSingle();
        if (error)
            this.throwQueryError('update product', error);
        return data;
    }
    async updateDocument(productId, documentUpdates) {
        const documents = await this.listDocuments([productId]);
        const existingDoc = documents[0]?.search_document;
        if (!existingDoc)
            return;
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
        if (error)
            this.logger.warn(`Failed to update product document for ${productId}: ${error.message}`);
    }
    async updateMediaUrl(productId, productUrl) {
        const media = await this.listMedia([productId]);
        const targetMedia = media[0];
        if (targetMedia && targetMedia.media_id) {
            const { error } = await this.supabase
                .getClient()
                .from('product_media')
                .update({ product_url: productUrl })
                .eq('media_id', targetMedia.media_id);
            if (error)
                this.logger.warn(`Failed to update product_media for ${productId}: ${error.message}`);
        }
        else if (productUrl) {
            const { error } = await this.supabase
                .getClient()
                .from('product_media')
                .insert({
                product_id: productId,
                media_type: 'web_page',
                product_url: productUrl,
                position: 1,
            });
            if (error)
                this.logger.warn(`Failed to insert product_media for ${productId}: ${error.message}`);
        }
    }
    async updateSpecifications(productId, specifications) {
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
            if (error)
                this.logger.warn(`Failed to update specification ${spec.canonical_key}: ${error.message}`);
        }
    }
    parseNormalizedValue(valStr) {
        if (!valStr || !valStr.trim()) {
            return { type: 'string', value: '' };
        }
        const str = valStr.trim();
        const rangeMatch = str.match(/^([+-]?\d+(?:\.\d+)?)\s*[\u2013\u2014-]\s*([+-]?\d+(?:\.\d+)?)\s*(.*)$/);
        if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
            return {
                type: 'range',
                min_value: parseFloat(rangeMatch[1]),
                max_value: parseFloat(rangeMatch[2]),
                unit: rangeMatch[3] ? rangeMatch[3].trim() : '',
            };
        }
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
    async listDocuments(productIds) {
        if (productIds.length === 0)
            return [];
        const { data, error } = await this.supabase
            .getClient()
            .from('product_documents')
            .select('product_id,search_document')
            .in('product_id', productIds);
        if (error)
            this.throwQueryError('load product documents', error);
        return (data ?? []);
    }
    async listSpecifications(productId) {
        const { data, error } = await this.supabase
            .getClient()
            .from('product_specifications')
            .select('specification_id,canonical_key,quantity_kind,normalized_value,raw_ref')
            .eq('product_id', productId)
            .order('specification_id', { ascending: true });
        if (error)
            this.throwQueryError('load product specifications', error);
        return (data ?? []);
    }
    async listSpecificationsByProductIds(productIds, canonicalKeys) {
        if (productIds.length === 0)
            return [];
        let query = this.supabase
            .getClient()
            .from('product_specifications')
            .select('specification_id,product_id,canonical_key,quantity_kind,normalized_value,raw_ref')
            .in('product_id', productIds);
        query = canonicalKeys ? query.in('canonical_key', canonicalKeys) : query.neq('normalized_value->>type', 'text');
        const { data, error } = await query
            .order('product_id', { ascending: true })
            .order('specification_id', { ascending: true });
        if (error)
            this.throwQueryError('load product specifications by id', error);
        return (data ?? []);
    }
    async listMedia(productIds) {
        if (productIds.length === 0)
            return [];
        const { data, error } = await this.supabase
            .getClient()
            .from('product_media')
            .select('media_id,product_id,media_type,image_url,product_url,position,metadata')
            .in('product_id', productIds)
            .order('position', { ascending: true });
        if (error)
            this.throwQueryError('load product media', error);
        return (data ?? []);
    }
    async findOne(column, value, activeOnly) {
        let query = this.supabase
            .getClient()
            .from('products')
            .select(productColumns)
            .eq(column, value);
        if (activeOnly)
            query = query.eq('status', 'active');
        const { data, error } = await query.maybeSingle();
        if (error)
            this.throwQueryError('load product', error);
        return data;
    }
    throwQueryError(operation, error) {
        this.logger.error(`${operation} failed: ${error.message}`);
        throw new common_1.ServiceUnavailableException('The product database is temporarily unavailable');
    }
};
exports.ProductsRepository = ProductsRepository;
exports.ProductsRepository = ProductsRepository = ProductsRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ProductsRepository);
//# sourceMappingURL=products.repository.js.map