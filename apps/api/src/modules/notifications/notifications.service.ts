import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import type { NotificationRow } from '../orders/orders.types';
import {
  CreateNotificationParams,
  NotificationsRepository,
  type NotificationItem,
} from './notifications.repository';

export interface MyNotificationsResult {
  items: NotificationItem[];
  unread_count: number;
  total: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  /**
   * Tạo thông báo mới (Exported để các module khác như OrdersModule sử dụng)
   */
  async create(params: CreateNotificationParams): Promise<NotificationRow> {
    if (!params.customer_id) {
      throw new BadRequestException(
        'Mã khách hàng customer_id không được để trống',
      );
    }
    if (!params.title || !params.title.trim()) {
      throw new BadRequestException('Tiêu đề thông báo không được để trống');
    }

    return await this.notificationsRepository.createNotification(params);
  }

  /**
   * GET /notifications/me?unread_only=
   * Lấy danh sách thông báo của chính người dùng (customer_id === req.user.id)
   */
  async getMyNotifications(
    user: User,
    unreadOnly = false,
  ): Promise<MyNotificationsResult> {
    const items = await this.notificationsRepository.findByCustomerId(
      user.id,
      unreadOnly,
    );
    const unreadCount = await this.notificationsRepository.countUnread(user.id);

    return {
      items,
      unread_count: unreadCount,
      total: items.length,
    };
  }

  /**
   * PATCH /notifications/:id/read
   * Đánh dấu 1 thông báo là đã đọc (chỉ của chính mình)
   */
  async markAsRead(user: User, id: string): Promise<NotificationRow> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID thông báo không hợp lệ');
    }

    // notifications.id is a uuid; anything else can never be the caller's notification
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id.trim(),
      )
    ) {
      throw new NotFoundException(`Không tìm thấy thông báo "${id}"`);
    }
    return await this.notificationsRepository.markAsRead(id.trim(), user.id);
  }

  /**
   * POST /notifications/read-all
   * Đánh dấu tất cả thông báo của chính mình là đã đọc
   */
  async markAllAsRead(
    user: User,
  ): Promise<{ success: boolean; updated_count: number }> {
    const res = await this.notificationsRepository.markAllAsRead(user.id);
    return {
      success: true,
      updated_count: res.updated_count,
    };
  }
}
