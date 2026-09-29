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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@reeco/shared");
const products_repository_1 = require("./products.repository");
let ProductsService = class ProductsService {
    productsRepository;
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    listPublic(query) {
        return this.list(query, true);
    }
    listAdmin(query) {
        return this.list(query, false);
    }
    getPublic(productId) {
        return this.getDetail(productId, true);
    }
    getAdmin(productId) {
        return this.getDetail(productId, false);
    }
    async updateAdmin(productId, updates) {
        const { name_vi, product_url, supported_protocols, specifications, ...productUpdates } = updates;
        let productRow = await this.productsRepository.findByIdOrModel(productId, false);
        if (!productRow)
            throw new common_1.NotFoundException('Product was not found');
        if (Object.keys(productUpdates).length > 0) {
            const updated = await this.productsRepository.update(productRow.product_id, productUpdates);
            if (!updated)
                throw new common_1.NotFoundException('Product update failed');
            productRow = updated;
        }
        const targetProductId = productRow.product_id;
        if (name_vi !== undefined ||
            supported_protocols !== undefined ||
            productUpdates.category ||
            productUpdates.subcategory ||
            productUpdates.device_type) {
            await this.productsRepository.updateDocument(targetProductId, {
                name_vi,
                supported_protocols,
                category: productUpdates.category,
                subcategory: productUpdates.subcategory,
                device_type: productUpdates.device_type,
            });
        }
        if (product_url !== undefined) {
            await this.productsRepository.updateMediaUrl(targetProductId, product_url);
        }
        if (specifications && Array.isArray(specifications)) {
            await this.productsRepository.updateSpecifications(targetProductId, specifications);
        }
        return this.getAdmin(targetProductId);
    }
    async getPublicSummariesByIds(productIds) {
        const products = await this.productsRepository.listByIds(productIds, true);
        const [documents, media] = await Promise.all([
            this.productsRepository.listDocuments(productIds),
            this.productsRepository.listMedia(productIds),
        ]);
        return new Map(products.map((product) => [
            product.product_id,
            this.toSummary(product, documents, media),
        ]));
    }
    async getActiveTechnicalIdentityCatalog() {
        const identities = await this.productsRepository.listActiveIdentityCatalog();
        return identities.map((identity) => ({
            productId: identity.product_id,
            model: identity.model,
        }));
    }
    async getSearchDocumentsByIds(productIds) {
        const documents = await this.productsRepository.listDocuments([
            ...new Set(productIds),
        ]);
        return new Map(documents.map((document) => [
            document.product_id,
            document.search_document,
        ]));
    }
    async getTechnicalEvidenceByIds(productIds) {
        const uniqueIds = [...new Set(productIds)];
        if (uniqueIds.length === 0)
            return new Map();
        const [products, documents, specifications] = await Promise.all([
            this.productsRepository.listByIds(uniqueIds, true),
            this.productsRepository.listDocuments(uniqueIds),
            this.productsRepository.listSpecificationsByProductIds(uniqueIds),
        ]);
        const documentsById = new Map(documents.map((document) => [
            document.product_id,
            document.search_document,
        ]));
        const specificationsById = this.groupSpecifications(specifications);
        return new Map(products.map((product) => [
            product.product_id,
            {
                product,
                document: documentsById.get(product.product_id) ?? null,
                specifications: specificationsById.get(product.product_id) ?? [],
            },
        ]));
    }
    async getEnvironmentalSpecificationsByIds(productIds) {
        return this.groupSpecifications(await this.productsRepository.listSpecificationsByProductIds(productIds, ['ingress_protection']));
    }
    async list(query, activeOnly) {
        const products = await this.productsRepository.list({
            category: query.category,
            subcategory: query.subcategory,
            device_type: query.device_type,
        }, activeOnly);
        const searchText = query.q?.toLocaleLowerCase();
        const filtered = searchText
            ? products.filter((product) => [product.model, product.product_name_en].some((value) => value.toLocaleLowerCase().includes(searchText)))
            : products;
        const start = (query.page - 1) * query.limit;
        const pageProducts = filtered.slice(start, start + query.limit);
        const productIds = pageProducts.map((product) => product.product_id);
        const [documents, media] = await Promise.all([
            this.productsRepository.listDocuments(productIds),
            this.productsRepository.listMedia(productIds),
        ]);
        return shared_1.ProductListResponseSchema.parse({
            items: pageProducts.map((product) => this.toSummary(product, documents, media)),
            pagination: {
                page: query.page,
                limit: query.limit,
                total: filtered.length,
                total_pages: filtered.length === 0 ? 0 : Math.ceil(filtered.length / query.limit),
            },
        });
    }
    async getDetail(productId, activeOnly) {
        const product = await this.productsRepository.findByIdOrModel(productId, activeOnly);
        if (!product)
            throw new common_1.NotFoundException('Product was not found');
        const [documents, specifications, media] = await Promise.all([
            this.productsRepository.listDocuments([product.product_id]),
            this.productsRepository.listSpecifications(product.product_id),
            this.productsRepository.listMedia([product.product_id]),
        ]);
        const rawDocument = documents[0]?.search_document;
        const document = rawDocument
            ? shared_1.ProductSearchDocumentSchema.parse(rawDocument)
            : null;
        return shared_1.ProductDetailSchema.parse({
            product: this.toSummary(product, documents, media),
            taxonomy: document?.taxonomy ?? null,
            measurements: document?.measurements ?? [],
            applications: document?.applications ?? [],
            capabilities: document?.capabilities ?? [],
            supported_protocols: document?.supported_protocols ?? [],
            unsupported_protocols: document?.unsupported_protocols ?? [],
            specifications: specifications.sort((left, right) => left.raw_ref.spec_index - right.raw_ref.spec_index),
            important_specifications: document?.important_specifications ?? [],
            aliases: document?.aliases ?? [],
            variants: document?.variants ?? [],
            media: media.map((item) => ({
                media_id: item.media_id,
                media_type: item.media_type,
                image_url: item.image_url,
                product_url: item.product_url,
                position: item.position,
                metadata: item.metadata,
            })),
        });
    }
    toSummary(product, documents, media) {
        const document = documents.find((item) => item.product_id === product.product_id)?.search_document;
        const primaryMedia = media.find((item) => item.product_id === product.product_id && item.image_url);
        return shared_1.ProductSummarySchema.parse({
            product_id: product.product_id,
            model: product.model,
            name_en: product.product_name_en,
            name_vi: document?.name_vi ?? null,
            category: product.category,
            subcategory: product.subcategory,
            device_type: product.device_type,
            image_url: primaryMedia?.image_url ?? null,
            status: product.status,
        });
    }
    groupSpecifications(specifications) {
        const grouped = new Map();
        for (const specification of specifications) {
            const { product_id: productId, ...publicSpecification } = specification;
            const productSpecifications = grouped.get(productId) ?? [];
            productSpecifications.push(publicSpecification);
            grouped.set(productId, productSpecifications);
        }
        return grouped;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [products_repository_1.ProductsRepository])
], ProductsService);
//# sourceMappingURL=products.service.js.map