import { z } from 'zod';

const nullableText = z.string().trim().min(1).nullable();
const nullableUrl = z.string().url().nullable();

export const ProductMasterStatusSchema = z.enum(['active', 'review']);

export const ProductMasterProductSchema = z
  .object({
    product_id: nullableText,
    model: nullableText,
    product_name_en: nullableText,
    category: nullableText,
    subcategory: nullableText,
    device_type: nullableText,
    product_url: nullableUrl,
    image_url: nullableUrl,
    status: ProductMasterStatusSchema,
  })
  .strict();

export const ProductMasterSchema = z
  .array(ProductMasterProductSchema)
  .length(50);

export type ProductMasterStatus = z.infer<typeof ProductMasterStatusSchema>;
export type ProductMasterProduct = z.infer<typeof ProductMasterProductSchema>;
export type ProductMaster = z.infer<typeof ProductMasterSchema>;
