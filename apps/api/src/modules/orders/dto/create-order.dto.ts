export interface CreateOrderItemDto {
  product_id: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  shipping_method?: 'standard' | 'express';
  payment_method: 'cod' | 'vnpay';
  shipping_address: string;
  city: string;
  province?: string;
  country?: string;
  postal_code?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes?: string;
}

export interface CancelOrderDto {
  reason?: string;
}

export interface UpdateOrderStatusDto {
  status: string;
  note?: string;
}

export interface CreateVNPayUrlDto {
  order_id: string;
}
