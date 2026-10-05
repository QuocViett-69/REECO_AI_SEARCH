import { z } from 'zod';

// Only the fields the admin product editor sends. `.strict()` rejects anything else, so
// columns such as product_id or model can never be written through this route.
const nullableText = z.string().trim().max(200).nullable();

export const AdminProductUpdateSchema = z
  .object({
    product_name_en: z.string().trim().min(1).max(300),
    name_vi: z.string().trim().max(300).nullable(),
    category: nullableText,
    subcategory: nullableText,
    device_type: nullableText,
    status: z.enum(['active', 'review']),
    // Shown as a link on the product page, so only http(s) URLs (no javascript: or data:)
    product_url: z.union([
      z.literal(''),
      z
        .string()
        .trim()
        .max(500)
        .url()
        .refine((value) => /^https?:\/\//i.test(value), 'Only http(s) URLs are allowed'),
    ]),
    supported_protocols: z.array(z.string().trim().min(1).max(60)).max(30),
    specifications: z
      .array(
        z.object({
          canonical_key: z.string().trim().min(1).max(120),
          value: z.string().max(500),
        }),
      )
      .max(200),
  })
  .partial()
  .strict();

export type AdminProductUpdate = z.infer<typeof AdminProductUpdateSchema>;
