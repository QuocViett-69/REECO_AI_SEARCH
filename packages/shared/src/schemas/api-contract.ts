import { z } from 'zod';

import {
  NormalizedValueSchema,
  RawSpecificationReferenceSchema,
} from './normalized-specification';
import {
  ImportantSearchSpecificationSchema,
  SearchDocumentSemanticItemSchema,
  SearchDocumentTaxonomySchema,
} from './product-search-document';
import { ProductVariantSchema } from './product-variant';

const NullableTextSchema = z.string().nullable();

export const ProductStatusSchema = z.enum(['active', 'review']);

export const ProductSummarySchema = z
  .object({
    product_id: z.string().min(1),
    model: z.string().min(1),
    name_en: z.string().min(1),
    name_vi: NullableTextSchema,
    category: NullableTextSchema,
    subcategory: NullableTextSchema,
    device_type: NullableTextSchema,
    image_url: z.string().url().nullable(),
    status: ProductStatusSchema,
  })
  .strict();

export const AdminProductSummarySchema = ProductSummarySchema;

export const PaginationSchema = z
  .object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
  })
  .strict();

export const ProductListResponseSchema = z
  .object({
    items: z.array(ProductSummarySchema),
    pagination: PaginationSchema,
  })
  .strict();

const OptionalFilterSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).max(200).optional(),
);

export const ProductListQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    q: OptionalFilterSchema,
    category: OptionalFilterSchema,
    subcategory: OptionalFilterSchema,
    device_type: OptionalFilterSchema,
  })
  .strict();

export const ProductSpecificationSchema = z
  .object({
    specification_id: z.number().int().positive(),
    canonical_key: z.string().min(1),
    quantity_kind: NullableTextSchema,
    normalized_value: z
      .union([
        NormalizedValueSchema,
        z.object({ type: z.literal('text'), value: z.string().min(1) }),
      ])
      .and(z.object({ value_raw: z.string().min(1).optional() })),
    raw_ref: RawSpecificationReferenceSchema,
  })
  .strict();

export const ProductMediaSchema = z
  .object({
    media_id: z.number().int().positive(),
    media_type: z.string().min(1),
    image_url: z.string().url().nullable(),
    product_url: z.string().url().nullable(),
    position: z.number().int().nonnegative(),
    metadata: z.record(z.unknown()),
  })
  .strict();

export const ProductDetailSchema = z
  .object({
    product: ProductSummarySchema,
    taxonomy: SearchDocumentTaxonomySchema.nullable(),
    measurements: z.array(SearchDocumentSemanticItemSchema),
    applications: z.array(SearchDocumentSemanticItemSchema),
    capabilities: z.array(SearchDocumentSemanticItemSchema),
    supported_protocols: z.array(z.string().min(1)),
    unsupported_protocols: z.array(z.string().min(1)),
    specifications: z.array(ProductSpecificationSchema),
    important_specifications: z.array(ImportantSearchSpecificationSchema),
    aliases: z.array(z.string().min(1)),
    variants: z.array(ProductVariantSchema).default([]),
    media: z.array(ProductMediaSchema),
  })
  .strict();

export const SearchRequestSchema = z
  .object({
    query: z.string().trim().min(1).max(500),
    limit: z.number().int().min(1).max(100).default(10),
    explain: z.boolean().optional(),
    context: z
      .object({
        base_query: z.string().trim().min(1).max(500),
        previous_query: z.string().trim().min(1).max(500),
        product_ids: z.array(z.string().min(1)).min(1).max(5),
      })
      .strict()
      .optional(),
  })
  .strict();

export const SearchScoresSchema = z
  .object({
    keyword: z.number().nonnegative(),
    semantic: z.number().nullable(),
    hybrid: z.number().nullable(),
    rerank: z.number().nullable(),
  })
  .strict();

export const SearchResultSchema = z
  .object({
    product_id: z.string().min(1),
    model: z.string().min(1),
    name_en: z.string().min(1),
    name_vi: NullableTextSchema,
    category: NullableTextSchema,
    device_type: NullableTextSchema,
    image_url: z.string().url().nullable(),
    matched_features: z.array(z.string()),
    scores: SearchScoresSchema,
    explanation: z
      .object({
        text: z.string().min(1),
        language: z.enum(['en', 'vi']),
        source: z.enum(['rule', 'llm']).optional(),
        evidence: z.array(
          z.object({
            source: z.enum(['products', 'product_document', 'normalized_spec']),
            field: z.string().min(1),
            value: z.string().min(1),
          }).strict(),
        ),
      })
      .strict()
      .optional(),
  })
  .strict();

export const SearchResponseSchema = z
  .object({
    query: z.string().min(1),
    resolved_query: z.string().min(1).optional(),
    context_applied: z.boolean().optional(),
    mode: z.enum(['keyword', 'semantic', 'hybrid']),
    results: z.array(SearchResultSchema),
  })
  .strict();

export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type ProductSummary = z.infer<typeof ProductSummarySchema>;
export type AdminProductSummary = z.infer<typeof AdminProductSummarySchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
export type ProductListQuery = z.infer<typeof ProductListQuerySchema>;
export type ProductSpecification = z.infer<typeof ProductSpecificationSchema>;
export type ProductMedia = z.infer<typeof ProductMediaSchema>;
export type ProductDetail = z.infer<typeof ProductDetailSchema>;
export type SearchRequest = z.infer<typeof SearchRequestSchema>;
export type SearchScores = z.infer<typeof SearchScoresSchema>;
export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
