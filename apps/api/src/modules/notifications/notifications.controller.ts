import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import type { Request } from 'express';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { NotificationsService } from './notifications.service';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('notifications')
@UseGuards(SupabaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /notifications/me?unread_only=
   * Lấy danh sách thông báo của chính mình, sắp xếp mới nhất trước
   */
  @Get('me')
  async getMyNotifications(
    @Req() req: RequestWithUser,
    @Query('unread_only') unreadOnly?: string,
  ) {
    const isUnreadOnly = unreadOnly === 'true' || unreadOnly === '1';
    return await this.notificationsService.getMyNotifications(
      req.user,
      isUnreadOnly,
    );
  }

  /**
   * PATCH /notifications/:id/read
   * Đánh dấu 1 thông báo là đã đọc (chỉ cho phép thông báo của chính mình)
   */
  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Req() req: RequestWithUser, @Param('id') id: string) {
    return await this.notificationsService.markAsRead(req.user, id);
  }

  /**
   * POST /notifications/read-all
   * Đánh dấu tất cả thông báo của chính mình là đã đọc
   */
  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: RequestWithUser) {
    return await this.notificationsService.markAllAsRead(req.user);
  }
}
