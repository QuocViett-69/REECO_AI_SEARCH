import { z } from 'zod';
import { PaymentMethodSchema, PaymentStatusSchema } from '@reeco/shared';

// GET /admin/payments?method=&status=&search=&page=&page_size=
export const AdminPaymentsQuerySchema = z.object({
  method: PaymentMethodSchema.optional(),
  status: PaymentStatusSchema.optional(),
  search: z.string().trim().max(100).optional().transform((v) => v || undefined),
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdminPaymentsQuery = z.infer<typeof AdminPaymentsQuerySchema>;
