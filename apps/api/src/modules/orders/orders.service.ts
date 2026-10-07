import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import type {
  CreateOrderDto,
  UpdateOrderStatusDto,
} from './dto/create-order.dto';
import {
  CANCELLABLE_STATUSES,
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  PAYMENT_STATUS,
  SHIPPING_METHODS,
  ShippingMethodKey,
} from './orders.constants';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly ordersRepository: OrdersRepository) {}

  /**
   * POST /orders:
   * - Gộp dòng trùng product_id, validate quantity (1-999)
   * - Lấy products + product_prices; sản phẩm không tồn tại / không active / chưa có giá -> 400 nói rõ sản phẩm nào
   * - shipping_fee từ SHIPPING_METHODS, total = subtotal + shipping_fee, tính ngày giao dự kiến
   * - COD -> PROCESSING / PENDING; VNPay -> PENDING_PAYMENT / PENDING_PAYMENT; ghi order_status_history + notification
   * - Xử lý transaction insert orders -> order_items (lỗi xóa orders)
   */
  async createOrder(user: User, dto: CreateOrderDto) {
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('Đơn hàng phải chứa ít nhất 1 sản phẩm');
    }

    if (
      !dto.customer_name?.trim() ||
      !dto.customer_phone?.trim() ||
      !dto.shipping_address?.trim()
    ) {
      throw new BadRequestException(
        'Vui lòng cung cấp đầy đủ thông tin: Họ tên, số điện thoại và địa chỉ giao hàng',
      );
    }

    // 1. Gộp các dòng trùng product_id và kiểm tra số lượng
    const mergedItemsMap = new Map<string, number>();
    for (const item of dto.items) {
      const pid = item.product_id?.trim();
      if (!pid) {
        throw new BadRequestException('Mã sản phẩm product_id không hợp lệ');
      }
      const qty = Math.floor(Number(item.quantity) || 0);
      if (qty < 1 || qty > 999) {
        throw new BadRequestException(
          `Số lượng cho sản phẩm "${pid}" phải nằm trong khoảng từ 1 đến 999`,
        );
      }
      mergedItemsMap.set(pid, (mergedItemsMap.get(pid) || 0) + qty);
    }

    // Kiểm tra sau khi gộp
    for (const [pid, totalQty] of mergedItemsMap.entries()) {
      if (totalQty > 999) {
        throw new BadRequestException(
          `Tổng số lượng đặt cho sản phẩm "${pid}" vượt quá giới hạn 999`,
        );
      }
    }

    const uniqueProductIds = Array.from(mergedItemsMap.keys());

    // 2. Lấy products + product_prices + product_media
    const snapshotsMap =
      await this.ordersRepository.getProductsAndPrices(uniqueProductIds);

    // 3. Kiểm tra từng sản phẩm: tồn tại, active, và có giá
    for (const pid of uniqueProductIds) {
      const snap = snapshotsMap.get(pid);
      if (!snap) {
        throw new BadRequestException(
          `Sản phẩm "${pid}" không tồn tại trong hệ thống`,
        );
      }
      if (snap.status !== 'active') {
        throw new BadRequestException(
          `Sản phẩm "${snap.model || pid}" hiện đang tạm ngừng kinh doanh (trạng thái: ${snap.status})`,
        );
      }
      if (
        snap.price_vnd === null ||
        snap.price_vnd === undefined ||
        snap.price_vnd <= 0
      ) {
        throw new BadRequestException(
          `Sản phẩm "${snap.model || pid}" chưa có biểu giá niêm yết trong cơ sở dữ liệu`,
        );
      }
    }

    // 4. Tính toán giá từng dòng & subtotal
    const orderItems: Array<{
      product_id: string;
      model: string;
      product_name: string;
      image_url: string | null;
      unit_price: number;
      quantity: number;
      line_total: number;
    }> = [];

    let subtotal = 0;
    for (const [pid, qty] of mergedItemsMap.entries()) {
      const snap = snapshotsMap.get(pid)!;
      const unitPrice = snap.price_vnd!;
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      orderItems.push({
        product_id: pid,
        model: snap.model,
        product_name: snap.product_name,
        image_url: snap.image_url,
        unit_price: unitPrice,
        quantity: qty,
        line_total: lineTotal,
      });
    }

    // 5. Phí vận chuyển và ngày giao dự kiến
    const shippingKey: ShippingMethodKey =
      dto.shipping_method === 'express' ? 'express' : 'standard';
    const shippingConfig = SHIPPING_METHODS[shippingKey];
    const shippingFee = shippingConfig.fee_vnd;
    const total = subtotal + shippingFee;

    const now = new Date();
    const estFromDate = new Date(now);
    estFromDate.setDate(estFromDate.getDate() + shippingConfig.min_days);
    const estToDate = new Date(now);
    estToDate.setDate(estToDate.getDate() + shippingConfig.max_days);

    const estFrom = estFromDate.toISOString().split('T')[0];
    const estTo = estToDate.toISOString().split('T')[0];

    // 6. Phân bổ trạng thái theo phương thức thanh toán
    const isCod = dto.payment_method?.toLowerCase() === 'cod';
    const initialStatus = isCod
      ? ORDER_STATUS.PROCESSING
      : ORDER_STATUS.PENDING_PAYMENT;
    const initialPaymentStatus = isCod
      ? PAYMENT_STATUS.COD_PENDING
      : PAYMENT_STATUS.PENDING_PAYMENT;

    // 7. Sinh số thứ tự đơn hàng

    // 8. Thực thi Transaction lưu đơn
    return await this.ordersRepository.createOrder({
      customerId: user.id,
      status: initialStatus,
      paymentMethod: isCod ? 'cod' : 'vnpay',
      paymentStatus: initialPaymentStatus,
      shippingMethod: shippingKey,
      shippingFee,
      subtotal,
      total,
      currency: 'VND',
      customerName: dto.customer_name.trim(),
      customerEmail: (dto.customer_email || user.email || '').trim(),
      customerPhone: dto.customer_phone.trim(),
      shippingAddress: dto.shipping_address.trim(),
      city: dto.city?.trim() || 'TP. Hồ Chí Minh',
      province: dto.province?.trim(),
      country: dto.country?.trim() || 'Vietnam',
      postalCode: dto.postal_code?.trim(),
      notes: dto.notes?.trim(),
      estimatedDeliveryFrom: estFrom,
      estimatedDeliveryTo: estTo,
      items: orderItems,
    });
  }

  /**
   * GET /orders/me?page=&page_size= (Mới nhất trước)
   */
  async getMyOrders(user: User, page = 1, pageSize = 20) {
    const p = Math.max(1, Number(page) || 1);
    const size = Math.min(100, Math.max(1, Number(pageSize) || 20));
    return await this.ordersRepository.findByCustomerId(user.id, p, size);
  }

  /**
   * GET /orders/:orderId
   * Nhận uuid / 1001 / REECO-1001; Không phải chủ đơn (và không phải admin) -> 404
   */
  async getOrderById(user: User, orderId: string) {
    const trimmed = orderId.trim();
    const order = await this.ordersRepository.findOrderByIdentifier(trimmed);

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
    }

    const isOwner = order.customer_id === user.id;
    const isAdmin = (user.app_metadata?.role as string) === 'admin';

    // Không phải chủ đơn và không phải admin -> 404 để bảo mật
    if (!isOwner && !isAdmin) {
      throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
    }

    return order;
  }

  /**
   * POST /orders/:orderId/cancel
   * Chỉ khi PENDING_PAYMENT, PAYMENT_FAILED, PAID, PROCESSING; khác -> 409
   */
  async cancelOrder(user: User, orderId: string, reason?: string) {
    const trimmed = orderId.trim();
    const order = await this.ordersRepository.findOrderByIdentifier(trimmed);

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
    }

    const isOwner = order.customer_id === user.id;
    const isAdmin = (user.app_metadata?.role as string) === 'admin';

    if (!isOwner && !isAdmin) {
      throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
    }

    // Kiểm tra trạng thái cho phép hủy
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new ConflictException(
        `Không thể hủy đơn hàng đang ở trạng thái "${order.status}". Chỉ có thể hủy khi đơn chưa bàn giao vận chuyển.`,
      );
    }

    return await this.ordersRepository.cancelOrder(
      order.id,
      user.id,
      order.status,
      reason,
    );
  }

  /**
   * GET /admin/orders?search=&status=&page=&page_size=
   */
  async listAdminOrders(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) {
    return await this.ordersRepository.listAdminOrders(params);
  }

  /**
   * GET /admin/orders/stats
   * Trả AdminOrderStats (doanh thu = tổng total của đơn payment_status = PAID)
   */
  async getAdminOrderStats() {
    return await this.ordersRepository.getAdminOrderStats();
  }

  /**
   * PATCH /admin/orders/:orderId/status
   * - Kiểm tra ORDER_STATUS_TRANSITIONS: sai -> 409 kèm danh sách trạng thái được phép
   * - COD -> PAID khi DELIVERED
   * - Mọi lần đổi trạng thái: cập nhật status + updated_at, ghi history (changed_by), tạo notification ORDER_STATUS_CHANGED / PAYMENT_UPDATED
   */
  async updateOrderStatusByAdmin(
    admin: User,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    if (!dto.status || !dto.status.trim()) {
      throw new BadRequestException('Trạng thái đơn hàng không được để trống');
    }

    const trimmed = orderId.trim();
    const order = await this.ordersRepository.findOrderByIdentifier(trimmed);

    if (!order) {
      throw new NotFoundException(`Không tìm thấy đơn hàng "${orderId}"`);
    }

    const currentStatus = order.status;
    const targetStatus = dto.status.trim();

    // 1. Kiểm tra transitions hợp lệ
    const allowedStatuses = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedStatuses.includes(targetStatus)) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: `Không thể chuyển trạng thái từ "${currentStatus}" sang "${targetStatus}".`,
        current_status: currentStatus,
        target_status: targetStatus,
        allowed_statuses: allowedStatuses,
      });
    }

    // 2. Xác định COD -> PAID khi DELIVERED
    const isCod = (order.payment_method || '').toLowerCase() === 'cod';
    const autoPaidCod = isCod && targetStatus === ORDER_STATUS.DELIVERED;

    return await this.ordersRepository.updateOrderStatusByAdmin(
      order,
      targetStatus,
      admin.id,
      dto.note,
      autoPaidCod,
    );
  }
}
