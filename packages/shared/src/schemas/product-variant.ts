import { z } from 'zod';

export const ProductVariantSpecificationSchema = z.object({
  section: z.string().nullable(),
  name_en: z.string().min(1),
  value_raw: z.string(),
});

export const ProductVariantSchema = z.object({
  product_id: z.string().min(1),
  model: z.string().min(1),
  product_name_en: z.string().min(1).nullable(),
  is_representative: z.boolean(),
  distinguishing_specifications: z.array(ProductVariantSpecificationSchema),
});

export type ProductVariantSpecification = z.infer<
  typeof ProductVariantSpecificationSchema
>;
export type ProductVariant = z.infer<typeof ProductVariantSchema>;
