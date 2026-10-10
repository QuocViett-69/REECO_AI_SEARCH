import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { SupabaseService } from '../../database/supabase/supabase.service';
import { AWAITING_PAYMENT_STATUSES, ORDER_STATUS } from './orders.constants';
import type { OrderRow, OrderUpdate, OrderWithItems } from './orders.types';

export interface ProductPriceSnapshot {
  product_id: string;
  model: string;
  product_name: string;
  status: string;
  price_vnd: number | null;
  image_url: string | null;
}

export interface CreateOrderParams {
  customerId: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingMethod: string;
  shippingFee: number;
  subtotal: number;
  total: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  province?: string;
  country: string;
  postalCode?: string;
  notes?: string;
  estimatedDeliveryFrom?: string;
  estimatedDeliveryTo?: string;
  items: Array<{
    product_id: string;
    model: string;
    product_name: string;
    image_url: string | null;
    unit_price: number;
    quantity: number;
    line_total: number;
  }>;
}

@Injectable()
export class OrdersRepository {
  private readonly logger = new Logger(OrdersRepository.name);

  /** Side records (history, notifications) must not fail the order write, but must not vanish silently either. */
  private warnIfFailed(
    label: string,
    result: { error: { message: string } | null },
  ): void {
    if (result.error)
      this.logger.warn(`Failed to insert ${label}: ${result.error.message}`);
  }

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Batch fetch product info, price in VND, and first image
   */
  async getProductsAndPrices(
    productIds: string[],
  ): Promise<Map<string, ProductPriceSnapshot>> {
    const client = this.supabase.getClient();

    // 1. Fetch products
    const { data: products, error: prodErr } = await client
      .from('products')
      .select('product_id, model, product_name_en, status')
      .in('product_id', productIds);

    if (prodErr) {
      this.logger.error(`Error querying products: ${prodErr.message}`);
      throw new ServiceUnavailableException(
        'Lỗi truy vấn danh mục sản phẩm từ cơ sở dữ liệu',
      );
    }

    // 2. Fetch prices
    const { data: prices, error: priceErr } = await client
      .from('product_prices')
      .select('product_id, price_vnd')
      .in('product_id', productIds);

    if (priceErr) {
      this.logger.error(`Error querying product_prices: ${priceErr.message}`);
      throw new ServiceUnavailableException(
        'Lỗi truy vấn bảng giá sản phẩm từ cơ sở dữ liệu',
      );
    }

    // 3. Fetch primary images
    const { data: media, error: mediaErr } = await client
      .from('product_media')
      .select('product_id, image_url, position, media_type')
      .in('product_id', productIds)
      .order('position', { ascending: true });

    if (mediaErr) {
      this.logger.warn(`Error querying product_media: ${mediaErr.message}`);
    }

    const priceMap = new Map<string, number>();
    (prices || []).forEach((p) => {
      priceMap.set(p.product_id, Number(p.price_vnd));
    });

    const imageMap = new Map<string, string>();
    (media || []).forEach((m) => {
      if (!imageMap.has(m.product_id) && m.image_url) {
        imageMap.set(m.product_id, m.image_url);
      }
    });

    const resultMap = new Map<string, ProductPriceSnapshot>();
    (products || []).forEach((p) => {
      resultMap.set(p.product_id, {
        product_id: p.product_id,
        model: p.model,
        product_name: p.product_name_en || p.model,
        status: p.status,
        price_vnd: priceMap.has(p.product_id)
          ? priceMap.get(p.product_id)!
          : null,
        image_url: imageMap.get(p.product_id) || null,
      });
    });

    return resultMap;
  }

  /**
   * Execute transactional order creation:
   * 1. Insert into orders
   * 2. Insert into order_items
   * 3. Insert into order_status_history
   * 4. Insert into notifications
   * Rollback order if inserting items fails
   */
  async createOrder(params: CreateOrderParams): Promise<OrderWithItems> {
    const client = this.supabase.getClient();
    const orderId = randomUUID();
    const nowIso = new Date().toISOString();

    const orderRecord: Record<string, string | number | null | undefined> = {
      id: orderId,
      customer_id: params.customerId,
      status: params.status,
      payment_method: params.paymentMethod,
      payment_status: params.paymentStatus,
      shipping_method: params.shippingMethod,
      shipping_fee: params.shippingFee,
      subtotal: params.subtotal,
      total: params.total,
      currency: params.currency || 'VND',
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone,
      shipping_address: params.shippingAddress,
      city: params.city,
      province: params.province || null,
      country: params.country || 'Vietnam',
      postal_code: params.postalCode || null,
      notes: params.notes || null,
      estimated_delivery_from: params.estimatedDeliveryFrom || null,
      estimated_delivery_to: params.estimatedDeliveryTo || null,
      created_at: nowIso,
      updated_at: nowIso,
    };

    // 1. Insert orders row
    const { data: insertedOrder, error: orderErr } = await client
      .from('orders')
      .insert(orderRecord)
      .select()
      .single();

    if (orderErr) {
      this.logger.error(`Failed to insert orders: ${orderErr.message}`);
      // Database details stay in the log; the client gets a stable message
      throw new ServiceUnavailableException(
        'Không thể tạo đơn hàng lúc này. Vui lòng thử lại sau.',
      );
    }

    // 2. Insert order_items
    const itemRows = params.items.map((it) => ({
      order_id: orderId,
      product_id: it.product_id,
      model: it.model,
      product_name: it.product_name,
      image_url: it.image_url,
      unit_price: it.unit_price,
      quantity: it.quantity,
      line_total: it.line_total,
    }));

    const { data: insertedItems, error: itemsErr } = await client
      .from('order_items')
      .insert(itemRows)
      .select();

    if (itemsErr) {
      this.logger.error(
        `Failed to insert order_items, rolling back order: ${itemsErr.message}`,
      );
      // Rollback inserted order
      await client.from('orders').delete().eq('id', orderId);
      throw new ServiceUnavailableException(
        'Không thể lưu chi tiết sản phẩm đơn hàng. Vui lòng thử lại sau.',
      );
    }

    // 3. Insert initial status history
    this.warnIfFailed(
      'status history',
      await client.from('order_status_history').insert({
        order_id: orderId,
        from_status: null,
        to_status: params.status,
        changed_by: params.customerId,
        note: 'Khởi tạo đơn hàng mới',
        created_at: nowIso,
      }),
    );

    // 4. Insert notification for customer
    this.warnIfFailed(
      'notification',
      await client.from('notifications').insert({
        customer_id: params.customerId,
        type: 'ORDER_CREATED',
        title: `Đơn hàng #${insertedOrder.order_number} đã được tạo`,
        message: `Đơn hàng ${insertedOrder.order_code} của bạn đã được ghi nhận vào hệ thống REECO.`,
        order_id: orderId,
        created_at: nowIso,
      }),
    );

    return {
      ...insertedOrder,
      items: insertedItems,
    };
  }

  /**
   * Find orders for a customer with pagination
   */
  async findByCustomerId(
    customerId: string,
    page = 1,
    pageSize = 20,
  ): Promise<{ items: OrderWithItems[]; total: number }> {
    const client = this.supabase.getClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await client
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error?.code === 'PGRST103') return emptyPageAfterEnd(error);
    if (error) {
      this.logger.error(`Error querying customer orders: ${error.message}`);
      throw new ServiceUnavailableException('Lỗi tải danh sách đơn hàng');
    }

    return {
      items: data || [],
      total: count || 0,
    };
  }

  /**
   * Find a single order by UUID, order_number (e.g. 1001), or order_code (e.g. REECO-1001)
   */
  async findOrderByIdentifier(
    identifier: string,
  ): Promise<OrderWithItems | null> {
    const client = this.supabase.getClient();
    let query = client
      .from('orders')
      .select('*, order_items(*), order_status_history(*)');

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier,
      );
    const isNumeric = /^\d+$/.test(identifier);

    if (isUuid) {
      query = query.eq('id', identifier);
    } else if (isNumeric) {
      query = query.eq('order_number', Number(identifier));
    } else {
      query = query.eq('order_code', identifier.trim().toUpperCase());
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      this.logger.error(
        `Error finding order by identifier ${identifier}: ${error.message}`,
      );
      return null;
    }

    return data;
  }

  /**
   * Cancel an order: update status, record history, and notify customer
   */
  async cancelOrder(
    orderId: string,
    customerId: string,
    currentStatus: string,
    reason?: string,
  ): Promise<OrderRow> {
    const client = this.supabase.getClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await client
      .from('orders')
      .update({
        status: 'CANCELLED',
        updated_at: nowIso,
      })
      .eq('id', orderId)
      // Only if nobody changed the order since it was checked (e.g. a VNPay callback)
      .eq('status', currentStatus)
      .select()
      .maybeSingle();

    if (error) {
      this.logger.error(`Error cancelling order: ${error.message}`);
      throw new ServiceUnavailableException('Không thể hủy đơn hàng');
    }
    if (!data) {
      throw new ConflictException(
        'Trạng thái đơn hàng vừa thay đổi. Vui lòng tải lại và thử lại.',
      );
    }

    // Record status history
    this.warnIfFailed(
      'status history',
      await client.from('order_status_history').insert({
        order_id: orderId,
        from_status: currentStatus,
        to_status: 'CANCELLED',
        changed_by: customerId,
        note: reason || 'Khách hàng yêu cầu hủy đơn hàng',
        created_at: nowIso,
      }),
    );

    // Create notification
    this.warnIfFailed(
      'notification',
      await client.from('notifications').insert({
        customer_id: customerId,
        type: 'ORDER_STATUS_CHANGED',
        title: `Đơn hàng #${data.order_number} đã được hủy`,
        message: `Đơn hàng ${data.order_code} đã được hủy thành công.`,
        order_id: orderId,
        created_at: nowIso,
      }),
    );

    return data;
  }

  /**
   * List orders for Admin with search and status filters
   */
  async listAdminOrders(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: OrderWithItems[]; total: number }> {
    const client = this.supabase.getClient();
    const page = Math.min(
      100_000,
      Math.max(1, Math.floor(Number(params.page)) || 1),
    );
    const pageSize = Math.min(100, Math.max(1, Number(params.pageSize) || 20));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = client
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' });

    // Status filter: only known statuses reach the query
    if (
      params.status &&
      (Object.values(ORDER_STATUS) as string[]).includes(params.status)
    ) {
      query = query.eq('status', params.status);
    }

    // Search filter
    if (params.search && params.search.trim()) {
      // The value is placed inside double quotes in a PostgREST or() filter; removing quotes
      // and backslashes keeps it from closing the quote and adding filter conditions.
      const q = params.search.trim().replace(/["\\]/g, '').slice(0, 100);
      const isNumeric = /^\d+$/.test(q);
      if (isNumeric) {
        query = query.or(
          `order_number.eq.${Number(q)},order_code.ilike."%${q}%",customer_name.ilike."%${q}%",customer_email.ilike."%${q}%",customer_phone.ilike."%${q}%",vnpay_txn_ref.ilike."%${q}%"`,
        );
      } else {
        query = query.or(
          `order_code.ilike."%${q}%",customer_name.ilike."%${q}%",customer_email.ilike."%${q}%",customer_phone.ilike."%${q}%",vnpay_txn_ref.ilike."%${q}%"`,
        );
      }
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error?.code === 'PGRST103') return emptyPageAfterEnd(error);
    if (error) {
      this.logger.error(`Error querying admin orders: ${error.message}`);
      throw new ServiceUnavailableException(
        'Lỗi tải danh sách đơn hàng quản trị',
      );
    }

    return {
      items: data || [],
      total: count || 0,
    };
  }

  /**
   * Update order status by Admin with audit log and customer notification
   */
  async updateOrderStatusByAdmin(
    order: OrderRow,
    newStatus: string,
    adminId: string,
    note?: string,
    autoPaidCod = false,
  ): Promise<OrderWithItems> {
    const client = this.supabase.getClient();
    const nowIso = new Date().toISOString();

    const updatePayload: OrderUpdate = {
      status: newStatus,
      updated_at: nowIso,
    };

    const isMarkingPaid = autoPaidCod || newStatus === 'PAID';
    if (isMarkingPaid) {
      updatePayload.payment_status = 'PAID';
      updatePayload.paid_at = nowIso;
    } else if (newStatus === 'PAYMENT_FAILED') {
      // Keep payment_status in step with the gateway path (recordPaymentFailure)
      updatePayload.payment_status = 'FAILED';
    } else if (newStatus === 'PENDING_PAYMENT') {
      // Same as updateOrderTxnRef when a failed VNPay order is reopened
      updatePayload.payment_status = 'PENDING_PAYMENT';
    }

    const { data, error } = await client
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id)
      // The transition was validated against this status; never overwrite a concurrent
      // change such as a VNPay IPN that marked the order paid meanwhile
      .eq('status', order.status)
      .select('*, order_items(*)')
      .maybeSingle();

    if (error) {
      this.logger.error(`Error updating order status: ${error.message}`);
      throw new ServiceUnavailableException(
        'Không thể cập nhật trạng thái đơn hàng',
      );
    }
    if (!data) {
      throw new ConflictException(
        'Trạng thái đơn hàng vừa thay đổi. Vui lòng tải lại và thử lại.',
      );
    }

    // Insert history
    this.warnIfFailed(
      'status history',
      await client.from('order_status_history').insert({
        order_id: order.id,
        from_status: order.status,
        to_status: newStatus,
        changed_by: adminId,
        note:
          note ||
          (autoPaidCod
            ? 'Giao hàng thành công - Tự động xác nhận thanh toán COD'
            : `Chuyển trạng thái sang ${newStatus}`),
        created_at: nowIso,
      }),
    );

    // Create notification: ORDER_STATUS_CHANGED
    this.warnIfFailed(
      'notification',
      await client.from('notifications').insert({
        customer_id: order.customer_id,
        type: 'ORDER_STATUS_CHANGED',
        title: `Cập nhật đơn hàng #${order.order_number}`,
        message: `Đơn hàng ${order.order_code} đã được chuyển sang trạng thái: ${newStatus}`,
        order_id: order.id,
        created_at: nowIso,
      }),
    );

    // If marked paid: create notification PAYMENT_UPDATED
    if (isMarkingPaid) {
      this.warnIfFailed(
        'notification',
        await client.from('notifications').insert({
          customer_id: order.customer_id,
          type: 'PAYMENT_UPDATED',
          title: `Thanh toán thành công đơn hàng #${order.order_number}`,
          message: autoPaidCod
            ? `Đơn hàng ${order.order_code} đã được xác nhận thanh toán tiền mặt (COD).`
            : `Đơn hàng ${order.order_code} đã được xác nhận thanh toán thành công.`,
          order_id: order.id,
          created_at: nowIso,
        }),
      );
    }

    return data;
  }

  /**
   * Get Admin Order Stats: total, revenue (paid orders), counts, daily revenue, top products
   */
  async getAdminOrderStats() {
    const client = this.supabase.getClient();

    // PostgREST caps each response (max_rows = 1000), so page through every order.
    // ponytail: aggregates in Node; move to a SQL view/RPC if order volume makes this slow.
    const allOrders = [];
    for (let offset = 0; ; offset += 1000) {
      const { data: page, error: ordersErr } = await client
        .from('orders')
        .select(
          'id, total, status, payment_status, payment_method, created_at, order_items(product_id, model, product_name, quantity, line_total)',
        )
        .order('id', { ascending: true })
        .range(offset, offset + 999);

      if (ordersErr) {
        this.logger.error(
          `Error fetching orders for stats: ${ordersErr.message}`,
        );
        throw new ServiceUnavailableException(
          'Lỗi tải dữ liệu thống kê đơn hàng',
        );
      }
      allOrders.push(...(page || []));
      if (!page || page.length < 1000) break;
    }
    let totalRevenue = 0;
    let paidOrdersCount = 0;
    let vnpayRevenue = 0;
    let codRevenue = 0;

    // Every status starts at 0 so the dashboard can show (and link to) each one
    const ordersByStatus: Record<string, number> = Object.fromEntries(
      Object.values(ORDER_STATUS).map((status) => [status, 0]),
    );

    let processingCount = 0;
    let shippedCount = 0;
    let deliveredCount = 0;
    let pendingCount = 0;
    let cancelledCount = 0;

    const dailyRevenueMap: Record<string, number> = {};
    const productSalesMap: Record<
      string,
      {
        model: string;
        name: string;
        totalQuantity: number;
        totalRevenue: number;
      }
    > = {};

    for (const ord of allOrders) {
      // A cancelled order is not revenue even if it was paid (it is owed a refund)
      const isPaid =
        ord.payment_status === 'PAID' && ord.status !== 'CANCELLED';
      const orderTotal = Number(ord.total) || 0;

      if (isPaid) {
        totalRevenue += orderTotal;
        paidOrdersCount++;

        const isVnPay = ord.payment_method === 'vnpay';
        if (isVnPay) {
          vnpayRevenue += orderTotal;
        } else {
          codRevenue += orderTotal;
        }

        const dateKey = (ord.created_at || '').substring(0, 10);
        if (dateKey) {
          dailyRevenueMap[dateKey] =
            (dailyRevenueMap[dateKey] || 0) + orderTotal;
        }

        // Aggregate top products
        const items = ord.order_items || [];
        for (const it of items) {
          const m = it.model || it.product_id;
          if (!productSalesMap[m]) {
            productSalesMap[m] = {
              model: m,
              name: it.product_name || m,
              totalQuantity: 0,
              totalRevenue: 0,
            };
          }
          productSalesMap[m].totalQuantity += Number(it.quantity) || 0;
          productSalesMap[m].totalRevenue += Number(it.line_total) || 0;
        }
      }

      ordersByStatus[ord.status] = (ordersByStatus[ord.status] || 0) + 1;

      switch (ord.status) {
        case 'PROCESSING':
          processingCount++;
          break;
        case 'SHIPPED':
          shippedCount++;
          break;
        case 'DELIVERED':
          deliveredCount++;
          break;
        case 'PENDING_PAYMENT':
          pendingCount++;
          break;
        case 'CANCELLED':
          cancelledCount++;
          break;
      }
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    const averageOrderValue =
      paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

    return {
      totalOrders: allOrders.length,
      totalRevenue,
      paidOrdersCount,
      averageOrderValue,
      processingCount,
      shippedCount,
      deliveredCount,
      pendingCount,
      cancelledCount,
      ordersByStatus,
      vnpayRevenue,
      codRevenue,
      dailyRevenueMap,
      topProducts,
    };
  }

  /**
   * Find order by VNPay Transaction Reference (vnp_TxnRef)
   */
  async findOrderByTxnRef(txnRef: string): Promise<OrderWithItems | null> {
    const client = this.supabase.getClient();
    const ref = txnRef.trim();
    const { data, error } = await client
      .from('orders')
      .select('*, order_items(*), order_status_history(*)')
      .eq('vnpay_txn_ref', ref)
      .maybeSingle();

    if (error) {
      this.logger.error(
        `Error querying order by vnpay_txn_ref: ${error.message}`,
      );
      return null;
    }
    if (data) return data;

    // An earlier attempt's link stays payable at VNPay after create-url issued a newer ref.
    // Refs are `${order_number}${Date.now() (13 digits)}${3 random digits}` (VnpayService), so
    // the order is still recoverable from the ref. Callers have already checked the signature.
    const orderNumber = parseOrderNumberFromTxnRef(ref);
    if (orderNumber === null) return null;
    const { data: byNumber, error: numberErr } = await client
      .from('orders')
      .select('*, order_items(*), order_status_history(*)')
      .eq('order_number', orderNumber)
      .maybeSingle();
    if (numberErr) {
      this.logger.error(
        `Error querying order by number from txn ref: ${numberErr.message}`,
      );
      return null;
    }
    return byNumber;
  }

  /**
   * Update order's VNPay TxnRef. If resetToPendingPayment is true (e.g. from PAYMENT_FAILED),
   * also reset status and payment_status to PENDING_PAYMENT and log status history.
   */
  async updateOrderTxnRef(
    orderId: string,
    txnRef: string,
    resetToPendingPayment = false,
  ): Promise<OrderRow> {
    const client = this.supabase.getClient();
    const nowIso = new Date().toISOString();

    const updatePayload: OrderUpdate = {
      vnpay_txn_ref: txnRef,
      updated_at: nowIso,
    };

    if (resetToPendingPayment) {
      updatePayload.status = 'PENDING_PAYMENT';
      updatePayload.payment_status = 'PENDING_PAYMENT';
    }

    const { data, error } = await client
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      // Never re-arm an order a concurrent IPN already paid (or that was cancelled)
      .in('status', AWAITING_PAYMENT_STATUSES)
      .select('*, order_items(*)')
      .maybeSingle();

    if (error) {
      this.logger.error(`Error updating order txn ref: ${error.message}`);
      throw new ServiceUnavailableException(
        'Không thể lưu mã giao dịch VNPay cho đơn hàng',
      );
    }
    if (!data) {
      throw new ConflictException(
        'Trạng thái đơn hàng vừa thay đổi. Vui lòng tải lại và thử lại.',
      );
    }

    if (resetToPendingPayment) {
      this.warnIfFailed(
        'status history',
        await client.from('order_status_history').insert({
          order_id: orderId,
          from_status: 'PAYMENT_FAILED',
          to_status: 'PENDING_PAYMENT',
          changed_by: data.customer_id,
          note: `Khởi tạo lại thanh toán VNPay (Mã giao dịch: ${txnRef})`,
          created_at: nowIso,
        }),
      );
    }

    return data;
  }

  /**
   * Record successful payment via VNPay:
   * - Update orders: status = PROCESSING, payment_status = PAID, paid_at = now, vnpay_transaction_no
   * - Insert history: from order.status -> PROCESSING
   * - Insert notifications: ORDER_STATUS_CHANGED, PAYMENT_UPDATED
   */
  async recordPaymentSuccess(
    order: OrderRow,
    vnpayTransactionNo: string,
  ): Promise<OrderWithItems | null> {
    const client = this.supabase.getClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await client
      .from('orders')
      .update({
        status: 'PROCESSING',
        payment_status: 'PAID',
        paid_at: nowIso,
        vnpay_transaction_no: vnpayTransactionNo,
        updated_at: nowIso,
      })
      .eq('id', order.id)
      // Never revive an order that was cancelled or moved on meanwhile
      .in('status', AWAITING_PAYMENT_STATUSES)
      .select('*, order_items(*)')
      .maybeSingle();

    if (error) {
      this.logger.error(`Error recording payment success: ${error.message}`);
      throw new ServiceUnavailableException(
        'Không thể cập nhật trạng thái thanh toán thành công',
      );
    }
    if (!data) return null;

    // Insert history
    this.warnIfFailed(
      'status history',
      await client.from('order_status_history').insert({
        order_id: order.id,
        from_status: order.status,
        to_status: 'PROCESSING',
        changed_by: order.customer_id,
        note: `Thanh toán thành công qua cổng VNPay (Mã giao dịch: ${vnpayTransactionNo})`,
        created_at: nowIso,
      }),
    );

    // Notification ORDER_STATUS_CHANGED
    this.warnIfFailed(
      'notification',
      await client.from('notifications').insert({
        customer_id: order.customer_id,
        type: 'ORDER_STATUS_CHANGED',
        title: `Cập nhật đơn hàng #${order.order_number}`,
        message: `Đơn hàng ${order.order_code} đã được chuyển sang trạng thái: PROCESSING`,
        order_id: order.id,
        created_at: nowIso,
      }),
    );

    // Notification PAYMENT_UPDATED
    this.warnIfFailed(
      'notification',
      await client.from('notifications').insert({
        customer_id: order.customer_id,
        type: 'PAYMENT_UPDATED',
        title: `Thanh toán thành công đơn hàng #${order.order_number}`,
        message: `Đơn hàng ${order.order_code} đã được thanh toán thành công qua cổng VNPay.`,
        order_id: order.id,
        created_at: nowIso,
      }),
    );

    return data;
  }

  /**
   * Record failed payment via VNPay:
   * - Update orders: status = PAYMENT_FAILED, payment_status = FAILED
   * - Insert history: from order.status -> PAYMENT_FAILED
   * - Insert notifications: ORDER_STATUS_CHANGED
   */
  async recordPaymentFailure(
    order: OrderRow,
    responseCode: string,
    vnpayTransactionNo?: string,
  ): Promise<OrderWithItems | null> {
    const client = this.supabase.getClient();
    const nowIso = new Date().toISOString();

    const updatePayload: OrderUpdate = {
      status: 'PAYMENT_FAILED',
      payment_status: 'FAILED',
      updated_at: nowIso,
    };
    if (vnpayTransactionNo) {
      updatePayload.vnpay_transaction_no = vnpayTransactionNo;
    }

    const { data, error } = await client
      .from('orders')
      .update(updatePayload)
      .eq('id', order.id)
      .in('status', AWAITING_PAYMENT_STATUSES)
      .select('*, order_items(*)')
      .maybeSingle();

    if (error) {
      this.logger.error(`Error recording payment failure: ${error.message}`);
      throw new ServiceUnavailableException(
        'Không thể cập nhật trạng thái thanh toán thất bại',
      );
    }
    if (!data) return null;

    // Insert history
    this.warnIfFailed(
      'status history',
      await client.from('order_status_history').insert({
        order_id: order.id,
        from_status: order.status,
        to_status: 'PAYMENT_FAILED',
        changed_by: order.customer_id,
        note: `Thanh toán thất bại qua cổng VNPay (Mã lỗi: ${responseCode})`,
        created_at: nowIso,
      }),
    );

    // Notification ORDER_STATUS_CHANGED
    this.warnIfFailed(
      'notification',
      await client.from('notifications').insert({
        customer_id: order.customer_id,
        type: 'ORDER_STATUS_CHANGED',
        title: `Thanh toán thất bại đơn hàng #${order.order_number}`,
        message: `Giao dịch thanh toán cho đơn hàng ${order.order_code} qua cổng VNPay không thành công (Mã lỗi: ${responseCode}). Vui lòng thanh toán lại.`,
        order_id: order.id,
        created_at: nowIso,
      }),
    );

    return data;
  }
}

/** Order number encoded in a VNPay txn ref (`${order_number}${13-digit ms}${3 digits}`), or null. */
export function parseOrderNumberFromTxnRef(txnRef: string): number | null {
  const match = /^(\d+)\d{16}$/.exec(txnRef);
  return match ? Number(match[1]) : null;
}

/**
 * A page past the end makes PostgREST answer 416 (PGRST103, "... but there are only N rows")
 * instead of an empty list; turn it back into an empty page with the real total.
 */
function emptyPageAfterEnd(error: { details?: string | null }) {
  const total = Number(/only (\d+) rows?/.exec(error.details ?? '')?.[1] ?? 0);
  return { items: [], total };
}
