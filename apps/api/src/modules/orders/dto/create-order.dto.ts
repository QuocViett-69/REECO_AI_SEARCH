import { z } from 'zod';
import { ORDER_STATUS } from '../orders.constants';

// Runtime schemas for order request bodies. Unknown keys are stripped (not rejected) so a
// client that sends an extra field keeps working; every field the service reads is checked.
const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : undefined));

export const CreateOrderItemSchema = z.object({
  product_id: text(100),
  quantity: z.number().int().min(1).max(999),
  expected_unit_price: z.number().int().nonnegative().optional(),
});

export const CreateOrderSchema = z.object({
  items: z.array(CreateOrderItemSchema).min(1).max(50),
  shipping_method: z.enum(['standard', 'express']).optional(),
  payment_method: z.enum(['cod', 'vnpay']),
  shipping_address: text(500),
  city: text(120),
  province: optionalText(120),
  country: optionalText(80),
  postal_code: optionalText(20),
  customer_name: text(120),
  customer_email: z.string().trim().email().max(254),
  customer_phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ().-]{6,20}$/, 'Số điện thoại không hợp lệ'),
  notes: optionalText(1000),
});

export const CancelOrderSchema = z
  .object({ reason: optionalText(500) })
  .default({});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(Object.values(ORDER_STATUS) as [string, ...string[]]),
  note: optionalText(500),
});

export const CreateVNPayUrlSchema = z.object({
  order_id: text(100),
});

export type CreateOrderItemDto = z.infer<typeof CreateOrderItemSchema>;
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type CancelOrderDto = z.infer<typeof CancelOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;
export type CreateVNPayUrlDto = z.infer<typeof CreateVNPayUrlSchema>;
