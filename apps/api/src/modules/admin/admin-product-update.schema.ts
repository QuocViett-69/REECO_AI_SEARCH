import { z } from 'zod';

const MAX_PRICE_VND = 100_000_000_000;

export const AdminProductPriceUpdateSchema = z.object({
  price_vnd: z.number().int().min(0).max(MAX_PRICE_VND),
}).strict();

// shortcut: the demo catalog is frozen; restore editing only with atomic index/embedding updates.
export const AdminProductUpdateSchema = AdminProductPriceUpdateSchema;
export type AdminProductUpdate = z.infer<typeof AdminProductUpdateSchema>;
export type AdminProductPriceUpdate = z.infer<typeof AdminProductPriceUpdateSchema>;
