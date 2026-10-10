import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'PAID',
  'PROCESSING',
  'FORWARDED_TO_MANUFACTURER',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'PAYMENT_FAILED',
]);

export const PaymentStatusSchema = z.enum([
  'PENDING_PAYMENT',
  'COD_PENDING',
  'PAID',
  'FAILED',
]);

export const PaymentMethodSchema = z.enum(['cod', 'vnpay']);

export const ShippingMethodSchema = z.enum(['standard', 'express']);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type ShippingMethod = z.infer<typeof ShippingMethodSchema>;

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ['PAID', 'PAYMENT_FAILED', 'CANCELLED'],
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['FORWARDED_TO_MANUFACTURER', 'SHIPPED', 'CANCELLED'],
  FORWARDED_TO_MANUFACTURER: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  PAYMENT_FAILED: ['PENDING_PAYMENT', 'CANCELLED'],
};

export const SHIPPING_METHODS: Record<ShippingMethod, {
  id: ShippingMethod;
  name: string;
  fee: number;
  deliveryDaysMin: number;
  deliveryDaysMax: number;
  description: string;
}> = {
  standard: {
    id: 'standard',
    name: 'Standard Delivery',
    fee: 250000,
    deliveryDaysMin: 7,
    deliveryDaysMax: 10,
    description: 'Standard delivery: 7–10 days',
  },
  express: {
    id: 'express',
    name: 'Express Air Freight',
    // Must match the fee the API charges (apps/api/src/modules/orders/orders.constants.ts)
    fee: 500000,
    deliveryDaysMin: 2,
    deliveryDaysMax: 3,
    description: 'Express air freight: 2–3 days',
  },
};

export const OrderItemRequestSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const ShippingInfoSchema = z.object({
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().min(1),
  shipping_address: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  country: z.string().min(1),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
});

export const CreateOrderRequestSchema = z.object({
  items: z.array(OrderItemRequestSchema).min(1),
  shipping_method: ShippingMethodSchema,
  payment_method: PaymentMethodSchema,
  shipping_info: ShippingInfoSchema,
});

export type OrderItemRequest = z.infer<typeof OrderItemRequestSchema>;
export type ShippingInfo = z.infer<typeof ShippingInfoSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderRequestSchema>;
export const OrderItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number(),
  total: z.number(),
});

export const OrderStatusHistorySchema = z.object({
  status: OrderStatusSchema,
  created_at: z.string().datetime(),
  note: z.string().nullable().optional(),
});

export const OrderSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  order_code: z.string().optional(),
  status: OrderStatusSchema,
  payment_status: PaymentStatusSchema,
  payment_method: PaymentMethodSchema,
  shipping_method: ShippingMethodSchema,
  total: z.number(),
  items: z.array(OrderItemSchema),
  status_history: z.array(OrderStatusHistorySchema).optional(),
  shipping_info: ShippingInfoSchema.optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const OrderListResponseSchema = z.object({
  orders: z.array(OrderSchema),
  total: z.number().int().nonnegative(),
});

export const UpdateOrderStatusRequestSchema = z.object({
  status: OrderStatusSchema,
  note: z.string().optional(),
});

export const AdminOrderStatsSchema = z.object({
  total_orders: z.number().int().nonnegative(),
  total_revenue: z.number().nonnegative(),
  orders_by_status: z.record(OrderStatusSchema, z.number().int().nonnegative()),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type OrderStatusHistory = z.infer<typeof OrderStatusHistorySchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderListResponse = z.infer<typeof OrderListResponseSchema>;
export type UpdateOrderStatusRequest = z.infer<typeof UpdateOrderStatusRequestSchema>;
export type AdminOrderStats = z.infer<typeof AdminOrderStatsSchema>;
