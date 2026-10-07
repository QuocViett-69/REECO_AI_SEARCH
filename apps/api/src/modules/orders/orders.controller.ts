import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CancelOrderSchema,
  CreateOrderSchema,
  type CancelOrderDto,
  type CreateOrderDto,
} from './dto/create-order.dto';
import { OrdersService } from './orders.service';

interface RequestWithUser {
  user: User;
}

@Controller('orders')
@UseGuards(SupabaseAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * POST /orders
   * Tạo đơn hàng mới từ giỏ hàng hoặc mua ngay
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Req() req: RequestWithUser,
    @Body(new ZodValidationPipe(CreateOrderSchema)) dto: CreateOrderDto,
  ) {
    return await this.ordersService.createOrder(req.user, dto);
  }

  /**
   * GET /orders/me
   * Lấy lịch sử đơn hàng của người dùng hiện tại (mới nhất trước)
   */
  @Get('me')
  async getMyOrders(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return await this.ordersService.getMyOrders(
      req.user,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 20,
    );
  }

  /**
   * GET /orders/:orderId
   * Xem chi tiết đơn hàng (nhận diện UUID, số thứ tự 1001, hoặc mã REECO-1001)
   */
  @Get(':orderId')
  async getOrderById(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
  ) {
    return await this.ordersService.getOrderById(req.user, orderId);
  }

  /**
   * POST /orders/:orderId/cancel
   * Hủy đơn hàng trước khi vận chuyển
   */
  @Post(':orderId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
    @Body(new ZodValidationPipe(CancelOrderSchema)) dto: CancelOrderDto,
  ) {
    return await this.ordersService.cancelOrder(req.user, orderId, dto?.reason);
  }
}
