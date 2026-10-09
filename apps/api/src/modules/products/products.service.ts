import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ProductDetailSchema,
  ProductListResponseSchema,
  ProductSearchDocumentSchema,
  ProductSummarySchema,
  type ProductDetail,
  type ProductListQuery,
  type ProductListResponse,
  type ProductMedia,
  type ProductSearchDocument,
  type ProductSpecification,
  type ProductSummary,
} from '@reeco/shared';
import {
  ProductsRepository,
  type ProductDocumentRow,
  type ProductIdentityRow,
  type ProductRow,
  type ProductSpecificationRow,
} from './products.repository';

export interface ProductTechnicalEvidence {
  product: ProductRow;
  document: ProductSearchDocument | null;
  specifications: ProductSpecification[];
}

export interface ProductTechnicalIdentity {
  productId: string;
  model: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: ProductsRepository) {}

  listPublic(query: ProductListQuery): Promise<ProductListResponse> {
    return this.list(query, true);
  }

  listAdmin(query: ProductListQuery): Promise<ProductListResponse> {
    return this.list(query, false);
  }

  getPublic(productId: string): Promise<ProductDetail> {
    return this.getDetail(productId, true);
  }

  getAdmin(productId: string): Promise<ProductDetail> {
    return this.getDetail(productId, false);
  }

  async getPublicSummariesByIds(
    productIds: string[],
  ): Promise<Map<string, ProductSummary>> {
    const products = await this.productsRepository.listByIds(productIds, true);
    const [documents, media] = await Promise.all([
      this.productsRepository.listDocuments(productIds),
      this.productsRepository.listMedia(productIds),
    ]);
    return new Map(
      products.map((product) => [
        product.product_id,
        this.toSummary(product, documents, media),
      ]),
    );
  }

  async getActiveTechnicalIdentityCatalog(): Promise<
    ProductTechnicalIdentity[]
  > {
    const identities =
      await this.productsRepository.listActiveIdentityCatalog();
    return identities.map((identity: ProductIdentityRow) => ({
      productId: identity.product_id,
      model: identity.model,
    }));
  }

  async getSearchDocumentsByIds(
    productIds: string[],
  ): Promise<Map<string, ProductSearchDocument>> {
    const documents = await this.productsRepository.listDocuments([
      ...new Set(productIds),
    ]);
    return new Map(
      documents.map((document) => [
        document.product_id,
        document.search_document,
      ]),
    );
  }

  async getTechnicalEvidenceByIds(
    productIds: string[],
  ): Promise<Map<string, ProductTechnicalEvidence>> {
    const uniqueIds = [...new Set(productIds)];
    if (uniqueIds.length === 0) return new Map();

    const [products, documents, specifications] = await Promise.all([
      this.productsRepository.listByIds(uniqueIds, true),
      this.productsRepository.listDocuments(uniqueIds),
      this.productsRepository.listSpecificationsByProductIds(uniqueIds),
    ]);
    const documentsById = new Map(
      documents.map((document) => [
        document.product_id,
        document.search_document,
      ]),
    );
    const specificationsById = this.groupSpecifications(specifications);

    return new Map(
      products.map((product) => [
        product.product_id,
        {
          product,
          document: documentsById.get(product.product_id) ?? null,
          specifications: specificationsById.get(product.product_id) ?? [],
        },
      ]),
    );
  }

  async getEnvironmentalSpecificationsByIds(productIds: string[]): Promise<Map<string, ProductSpecification[]>> {
    return this.groupSpecifications(await this.productsRepository.listSpecificationsByProductIds(productIds, ['ingress_protection']));
  }

  private async list(
    query: ProductListQuery,
    activeOnly: boolean,
  ): Promise<ProductListResponse> {
    const products = await this.productsRepository.list(
      {
        category: query.category,
        subcategory: query.subcategory,
        device_type: query.device_type,
      },
      activeOnly,
    );
    const searchText = query.q?.toLocaleLowerCase();
    const filtered = searchText
      ? products.filter((product) =>
          [product.model, product.product_name_en].some((value) =>
            value.toLocaleLowerCase().includes(searchText),
          ),
        )
      : products;
    const start = (query.page - 1) * query.limit;
    const pageProducts = filtered.slice(start, start + query.limit);
    const productIds = pageProducts.map((product) => product.product_id);
    const [documents, media] = await Promise.all([
      this.productsRepository.listDocuments(productIds),
      this.productsRepository.listMedia(productIds),
    ]);

    return ProductListResponseSchema.parse({
      items: pageProducts.map((product) =>
        this.toSummary(product, documents, media),
      ),
      pagination: {
        page: query.page,
        limit: query.limit,
        total: filtered.length,
        total_pages:
          filtered.length === 0 ? 0 : Math.ceil(filtered.length / query.limit),
      },
    });
  }

  private async getDetail(
    productId: string,
    activeOnly: boolean,
  ): Promise<ProductDetail> {
    const product = await this.productsRepository.findByIdOrModel(
      productId,
      activeOnly,
    );
    if (!product) throw new NotFoundException('Product was not found');

    const [documents, specifications, media] = await Promise.all([
      this.productsRepository.listDocuments([product.product_id]),
      this.productsRepository.listSpecifications(product.product_id),
      this.productsRepository.listMedia([product.product_id]),
    ]);
    const rawDocument = documents[0]?.search_document;
    const document = rawDocument
      ? ProductSearchDocumentSchema.parse(rawDocument)
      : null;

    return ProductDetailSchema.parse({
      product: this.toSummary(product, documents, media),
      taxonomy: document?.taxonomy ?? null,
      measurements: document?.measurements ?? [],
      applications: document?.applications ?? [],
      capabilities: document?.capabilities ?? [],
      supported_protocols: document?.supported_protocols ?? [],
      unsupported_protocols: document?.unsupported_protocols ?? [],
      specifications: specifications.sort(
        (left, right) => left.raw_ref.spec_index - right.raw_ref.spec_index,
      ),
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

  private toSummary(
    product: ProductRow,
    documents: ProductDocumentRow[],
    media: Array<ProductMedia & { product_id: string }>,
  ): ProductSummary {
    const document = documents.find(
      (item) => item.product_id === product.product_id,
    )?.search_document;
    const primaryMedia = media.find(
      (item) => item.product_id === product.product_id && item.image_url,
    );
    return ProductSummarySchema.parse({
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

  private groupSpecifications(
    specifications: ProductSpecificationRow[],
  ): Map<string, ProductSpecification[]> {
    const grouped = new Map<string, ProductSpecification[]>();
    for (const specification of specifications) {
      const { product_id: productId, ...publicSpecification } = specification;
      const productSpecifications = grouped.get(productId) ?? [];
      productSpecifications.push(publicSpecification);
      grouped.set(productId, productSpecifications);
    }
    return grouped;
  }
}
