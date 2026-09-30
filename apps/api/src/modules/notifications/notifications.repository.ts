import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { SupabaseService } from '../../database/supabase/supabase.service';

export interface CreateNotificationParams {
  customer_id: string;
  type: string;
  title: string;
  message: string;
  order_id?: string;
}

@Injectable()
export class NotificationsRepository {
  private readonly logger = new Logger(NotificationsRepository.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Lấy danh sách notifications của một khách hàng (chỉ của chính mình)
   */
  async findByCustomerId(customerId: string, unreadOnly = false): Promise<any[]> {
    const client = this.supabase.getClient();
    let query = client
      .from('notifications')
      .select('*')
      .eq('customer_id', customerId);

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      this.logger.error(`Error querying notifications: ${error.message}`);
      throw new ServiceUnavailableException('Lỗi tải danh sách thông báo');
    }

    return (data || []).map((n) => ({
      ...n,
      is_read: n.read_at !== null,
    }));
  }

  /**
   * Đếm số lượng thông báo chưa đọc của khách hàng
   */
  async countUnread(customerId: string): Promise<number> {
    const client = this.supabase.getClient();
    const { count, error } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .is('read_at', null);

    if (error) {
      this.logger.error(`Error counting unread notifications: ${error.message}`);
      return 0;
    }

    return count || 0;
  }

  /**
   * Đánh dấu 1 thông báo là đã đọc (yêu cầu đúng customer_id)
   */
  async markAsRead(id: string, customerId: string): Promise<any> {
    const client = this.supabase.getClient();
    const nowIso = new Date().toISOString();

    // Kiểm tra thông báo tồn tại và thuộc về khách hàng
    const { data: existing, error: findErr } = await client
      .from('notifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (findErr) {
      this.logger.error(`Error finding notification: ${findErr.message}`);
      throw new ServiceUnavailableException('Lỗi truy vấn thông báo');
    }

    if (!existing || existing.customer_id !== customerId) {
      throw new NotFoundException(`Không tìm thấy thông báo "${id}"`);
    }

    // Nếu đã đọc thì trả về nguyên bản
    if (existing.read_at) {
      return {
        ...existing,
        is_read: true,
      };
    }

    const { data, error } = await client
      .from('notifications')
      .update({ read_at: nowIso })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error marking notification read: ${error.message}`);
      throw new ServiceUnavailableException('Không thể cập nhật trạng thái đã đọc');
    }

    return {
      ...data,
      is_read: true,
    };
  }

  /**
   * Đánh dấu tất cả thông báo của khách hàng là đã đọc
   */
  async markAllAsRead(customerId: string): Promise<{ updated_count: number }> {
    const client = this.supabase.getClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await client
      .from('notifications')
      .update({ read_at: nowIso })
      .eq('customer_id', customerId)
      .is('read_at', null)
      .select();

    if (error) {
      this.logger.error(`Error marking all notifications read: ${error.message}`);
      throw new ServiceUnavailableException('Không thể đánh dấu đã đọc tất cả thông báo');
    }

    return {
      updated_count: (data || []).length,
    };
  }

  /**
   * Tạo mới 1 thông báo
   */
  async createNotification(params: CreateNotificationParams): Promise<any> {
    const client = this.supabase.getClient();
    const nowIso = new Date().toISOString();

    const record: Record<string, any> = {
      customer_id: params.customer_id,
      type: params.type,
      title: params.title.trim(),
      message: params.message.trim(),
      created_at: nowIso,
    };

    if (params.order_id) {
      record.order_id = params.order_id;
    }

    const { data, error } = await client
      .from('notifications')
      .insert(record)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating notification: ${error.message}`);
      throw new ServiceUnavailableException('Không thể tạo thông báo mới');
    }

    return {
      ...data,
      is_read: false,
    };
  }
}
