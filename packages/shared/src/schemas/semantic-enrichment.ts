import { z } from 'zod';

const SemanticKeySchema = z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/u);
const RawRefSchema = z.object({
  file: z.string().regex(/^data\/raw\/.+\.json$/u),
  product_index: z.number().int().nonnegative(),
  spec_index: z.number().int().nonnegative(),
  source_rows: z.array(z.number().int().nonnegative()),
});

export const SemanticEvidenceSchema = z.discriminatedUnion('source', [
  z.object({
    source: z.literal('product_master'),
    field: z.enum(['product_id', 'model', 'product_name_en']),
    value: z.string().min(1),
  }),
  z.object({
    source: z.literal('normalized_spec'),
    canonical_key: SemanticKeySchema,
    raw_ref: RawRefSchema,
  }),
]);

export const SemanticItemSchema = z.object({
  key: SemanticKeySchema,
  label_en: z.string().min(1),
  label_vi: z.string().min(1),
  evidence: z.array(SemanticEvidenceSchema).min(1),
});

export const SemanticProtocolSchema = z.object({
  name: z.string().min(1),
  relation: z.enum(['supported', 'unsupported']),
  evidence: z.array(SemanticEvidenceSchema).min(1),
});

export const SemanticAliasSchema = z.object({
  value: z.string().min(1),
  type: z.enum(['model', 'product_id', 'canonical_name', 'source_name']),
  language: z.enum(['en', 'vi', 'und']),
  evidence: z.array(SemanticEvidenceSchema).min(1),
});

export const SemanticEnrichmentDocumentSchema = z.object({
  schema_version: z.literal('1.0'),
  product_id: z.string().min(1),
  model: z.string().min(1),
  name_en: z.string().min(1),
  name_vi: z.string().min(1).nullable(),
  taxonomy: z.object({
    category: z.string().min(1),
    category_key: SemanticKeySchema,
    subcategory: z.string().min(1),
    subcategory_key: SemanticKeySchema,
    device_type: z.string().min(1),
    device_type_key: SemanticKeySchema,
  }),
  measurements: z.array(SemanticItemSchema),
  applications: z.array(SemanticItemSchema),
  protocols: z.array(SemanticProtocolSchema),
  capabilities: z.array(SemanticItemSchema),
  aliases: z.array(SemanticAliasSchema),
  search_keywords: z.object({
    en: z.array(z.string().min(1)),
    vi: z.array(z.string().min(1)),
  }),
});

export type SemanticEvidence = z.infer<typeof SemanticEvidenceSchema>;
export type SemanticItem = z.infer<typeof SemanticItemSchema>;
export type SemanticProtocol = z.infer<typeof SemanticProtocolSchema>;
export type SemanticAlias = z.infer<typeof SemanticAliasSchema>;
export type SemanticEnrichmentDocument = z.infer<
  typeof SemanticEnrichmentDocumentSchema
>;
