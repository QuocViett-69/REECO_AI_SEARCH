import { z } from 'zod';

import {
  NormalizedValueSchema,
  RawSpecificationReferenceSchema,
} from './normalized-specification';
import { ProductVariantSchema } from './product-variant';

const SemanticKeySchema = z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/u);

export const SearchDocumentTaxonomySchema = z.object({
  category: z.string().min(1),
  category_key: SemanticKeySchema,
  subcategory: z.string().min(1),
  subcategory_key: SemanticKeySchema,
  device_type: z.string().min(1),
  device_type_key: SemanticKeySchema,
});

export const SearchDocumentSemanticItemSchema = z.object({
  key: SemanticKeySchema,
  label_en: z.string().min(1),
  label_vi: z.string().min(1),
});

export const ImportantSearchSpecificationSchema = z.object({
  canonical_key: SemanticKeySchema,
  name: z.string().min(1),
  quantity_kind: z.string().min(1).nullable(),
  normalized_value: NormalizedValueSchema,
  raw_ref: RawSpecificationReferenceSchema,
});

export const ProductSearchDocumentSchema = z.object({
  schema_version: z.literal('1.0'),
  product_id: z.string().min(1),
  model: z.string().min(1),
  name_en: z.string().min(1),
  name_vi: z.string().min(1).nullable(),
  taxonomy: SearchDocumentTaxonomySchema,
  measurements: z.array(SearchDocumentSemanticItemSchema),
  applications: z.array(SearchDocumentSemanticItemSchema),
  capabilities: z.array(SearchDocumentSemanticItemSchema),
  supported_protocols: z.array(z.string().min(1)),
  unsupported_protocols: z.array(z.string().min(1)),
  aliases: z.array(z.string().min(1)),
  variants: z.array(ProductVariantSchema).default([]),
  important_specifications: z.array(ImportantSearchSpecificationSchema),
  search_keywords_en: z.array(z.string().min(1)),
  search_keywords_vi: z.array(z.string().min(1)),
  search_text_en: z.string().min(1),
  search_text_vi: z.string().min(1),
  search_text: z.string().min(1),
  content_hash: z.string().regex(/^[a-f0-9]{64}$/u),
  source_versions: z.object({
    product_master: z.literal('2.0'),
    technical_normalization: z.literal('1.2'),
    semantic_enrichment: z.literal('1.0'),
    semantic_vocabulary: z.literal('1.0'),
  }),
});

export type SearchDocumentTaxonomy = z.infer<
  typeof SearchDocumentTaxonomySchema
>;
export type SearchDocumentSemanticItem = z.infer<
  typeof SearchDocumentSemanticItemSchema
>;
export type ImportantSearchSpecification = z.infer<
  typeof ImportantSearchSpecificationSchema
>;
export type ProductSearchDocument = z.infer<typeof ProductSearchDocumentSchema>;
