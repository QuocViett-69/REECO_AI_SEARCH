import { z } from 'zod';

export const NotificationSchema = z.object({
  id: z.string().min(1),
  customer_id: z.string().min(1),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  order_id: z.string().optional(),
  is_read: z.boolean(),
  created_at: z.string().datetime(),
}).strict();

export type Notification = z.infer<typeof NotificationSchema>;
