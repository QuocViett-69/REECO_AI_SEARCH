import { z } from 'zod';

import { ProductVariantSchema } from './product-variant';

const NullableUnitSchema = z.string().min(1).nullable();
const QualifierSchema = z
  .enum(['<', '≤', '>', '≥', '±', '~', 'approximately', 'minimum', 'maximum'])
  .nullable();
const AlternateNumberSchema = z.object({
  value: z.number().finite(),
  unit: z.string().min(1),
});
const AlternateRangeSchema = z.object({
  min_value: z.number().finite(),
  max_value: z.number().finite(),
  unit: z.string().min(1),
});
const RangeEndpointSchema = z.object({
  value: z.number().finite(),
  unit: z.string().min(1),
});

export const NormalizedValueSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('number'),
    value: z.number().finite(),
    unit: NullableUnitSchema,
    qualifier: QualifierSchema,
    alternate: AlternateNumberSchema.optional(),
    condition: z.string().min(1).optional(),
    note: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal('range'),
    min_value: z.number().finite().optional(),
    max_value: z.number().finite().optional(),
    unit: NullableUnitSchema.optional(),
    min: RangeEndpointSchema.optional(),
    max: RangeEndpointSchema.optional(),
    qualifier: QualifierSchema,
    alternate: AlternateRangeSchema.optional(),
    condition: z.string().min(1).optional(),
    note: z.string().min(1).optional(),
  }),
  z.object({ type: z.literal('boolean'), value: z.boolean() }),
  z.object({
    type: z.literal('protocol'),
    values: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal('list'),
    values: z.array(z.string().min(1)).min(2),
  }),
]);

export const RawSpecificationReferenceSchema = z.object({
  file: z.string().regex(/^data\/raw\/.+\.json$/u),
  product_index: z.number().int().nonnegative(),
  spec_index: z.number().int().nonnegative(),
  source_rows: z.array(z.number().int().nonnegative()),
});

export const NormalizedSpecificationSchema = z
  .object({
    product_id: z.string().min(1),
    section: z.string().nullable(),
    name_raw: z.string(),
    value_raw: z.string(),
    type: z.enum(['number', 'range', 'boolean', 'protocol', 'list', 'text']),
    normalized: NormalizedValueSchema.nullable(),
    canonical_key: z
      .string()
      .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/u)
      .optional(),
    quantity_kind: z
      .enum([
        'temperature',
        'relative_humidity',
        'voltage',
        'current',
        'frequency',
        'pressure',
        'data_rate',
        'time',
        'mass',
        'torque',
        'power',
        'speed',
        'length',
      ])
      .optional(),
    facets: z
      .object({
        supported_protocols: z.array(z.string().min(1)),
        unsupported_protocols: z.array(z.string().min(1)),
      })
      .optional(),
    raw_ref: RawSpecificationReferenceSchema,
  })
  .superRefine((specification, context) => {
    if (specification.type === 'text' && specification.normalized !== null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Text specifications must have normalized=null.',
        path: ['normalized'],
      });
    }
    if (
      specification.type !== 'text' &&
      specification.normalized?.type !== specification.type
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'The outer type must match normalized.type.',
        path: ['normalized'],
      });
    }
    if (specification.normalized?.type === 'range') {
      const range = specification.normalized;
      const hasSharedUnitRange =
        range.min_value !== undefined &&
        range.max_value !== undefined &&
        range.unit !== undefined;
      const hasEndpointRange =
        range.min !== undefined && range.max !== undefined;
      if (hasSharedUnitRange === hasEndpointRange) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'A range must use exactly one representation: min_value/max_value/unit or min/max endpoints.',
          path: ['normalized'],
        });
      }
      if (
        hasSharedUnitRange &&
        range.min_value !== undefined &&
        range.max_value !== undefined &&
        range.min_value > range.max_value
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Range minimum cannot exceed maximum.',
          path: ['normalized'],
        });
      }
      if (
        range.alternate &&
        range.alternate.min_value > range.alternate.max_value
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Alternate range minimum cannot exceed maximum.',
          path: ['normalized', 'alternate'],
        });
      }
    }
  });

export const NormalizedSpecificationDocumentSchema = z.object({
  schema_version: z.literal('1.2'),
  product_id: z.string().min(1),
  model: z.string().min(1),
  raw_record_ref: z.object({
    file: z.string().regex(/^data\/raw\/.+\.json$/u),
    product_index: z.number().int().nonnegative(),
    raw_record_key: z.string().min(1),
    raw_product_id: z.string().nullable(),
    raw_model: z.string().nullable(),
  }),
  variants: z.array(ProductVariantSchema).default([]),
  specifications: z.array(NormalizedSpecificationSchema),
});

export type NormalizedValue = z.infer<typeof NormalizedValueSchema>;
export type RawSpecificationReference = z.infer<
  typeof RawSpecificationReferenceSchema
>;
export type NormalizedSpecification = z.infer<
  typeof NormalizedSpecificationSchema
>;
export type NormalizedSpecificationDocument = z.infer<
  typeof NormalizedSpecificationDocumentSchema
>;
