import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { AdminGuard } from '../../auth/admin.guard';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  UpdateOrderStatusSchema,
  type UpdateOrderStatusDto,
} from './dto/create-order.dto';
import { OrdersService } from './orders.service';

interface RequestWithUser {
  user: User;
}

@Controller('admin/orders')
@UseGuards(SupabaseAuthGuard, AdminGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * GET /admin/orders/stats
   * Trả AdminOrderStats (doanh thu = tổng total của đơn payment_status = PAID)
   */
  @Get('stats')
  async getOrderStats() {
    return await this.ordersService.getAdminOrderStats();
  }

  /**
   * GET /admin/orders?search=&status=&page=&page_size=
   * Tìm kiếm theo mã đơn hàng, tên khách hàng, email, số điện thoại
   */
  @Get()
  async listOrders(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return await this.ordersService.listAdminOrders({
      search,
      status,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }

  /**
   * GET /admin/orders/:orderId
   * Chi tiết đơn hàng cho quản trị viên
   */
  @Get(':orderId')
  async getOrderDetail(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
  ) {
    return await this.ordersService.getOrderById(req.user, orderId);
  }

  /**
   * PATCH /admin/orders/:orderId/status
   * Kiểm tra ORDER_STATUS_TRANSITIONS, sai -> 409 kèm danh sách trạng thái được phép; COD -> PAID khi DELIVERED
   * Cập nhật status + updated_at, ghi history (changed_by), tạo notification ORDER_STATUS_CHANGED / PAYMENT_UPDATED
   */
  @Patch(':orderId/status')
  @HttpCode(HttpStatus.OK)
  async updateOrderStatus(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
    @Body(new ZodValidationPipe(UpdateOrderStatusSchema))
    dto: UpdateOrderStatusDto,
  ) {
    return await this.ordersService.updateOrderStatusByAdmin(
      req.user,
      orderId,
      dto,
    );
  }
}
