// Row shapes of the commerce tables (supabase/migrations/20261001000000_commerce_foundation.sql).
// bigint columns arrive from PostgREST as numbers.

export interface OrderRow {
  id: string;
  order_number: number;
  order_code: string;
  customer_id: string;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_method: string;
  shipping_fee: number;
  subtotal: number;
  total: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  province: string | null;
  country: string;
  postal_code: string | null;
  notes: string | null;
  estimated_delivery_from: string | null;
  estimated_delivery_to: string | null;
  vnpay_txn_ref: string | null;
  vnpay_transaction_no: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRow {
  id: number;
  order_id: string;
  product_id: string;
  model: string;
  product_name: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderStatusHistoryRow {
  id: number;
  order_id: string;
  from_status: string | null;
  to_status: string;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

/** An order as the API returns it, with whichever related rows the query selected. */
export interface OrderWithItems extends OrderRow {
  order_items?: OrderItemRow[];
  items?: OrderItemRow[];
  order_status_history?: OrderStatusHistoryRow[];
}

/** Columns an order update may set. */
export type OrderUpdate = Partial<
  Pick<
    OrderRow,
    | 'status'
    | 'payment_status'
    | 'paid_at'
    | 'vnpay_txn_ref'
    | 'vnpay_transaction_no'
    | 'updated_at'
  >
>;

export interface NotificationRow {
  id: string;
  customer_id: string;
  type: string;
  title: string;
  message: string;
  order_id: string | null;
  read_at: string | null;
  created_at: string;
}
