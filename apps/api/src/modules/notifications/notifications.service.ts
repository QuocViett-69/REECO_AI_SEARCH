import {
  BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import {
  CreateNotificationParams,
  NotificationsRepository,
} from './notifications.repository';

export interface MyNotificationsResult {
  items: any[];
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
   * Tạo thông báo mới (Exported để các module khác như OrdersModule / PaymentsModule sử dụng)
   */
  async create(params: CreateNotificationParams): Promise<any> {
    if (!params.customer_id) {
      throw new BadRequestException('Mã khách hàng customer_id không được để trống');
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
  async markAsRead(user: User, id: string): Promise<any> {
    if (!id || !id.trim()) {
      throw new BadRequestException('ID thông báo không hợp lệ');
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
