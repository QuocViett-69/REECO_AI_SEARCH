import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@supabase/supabase-js';
import type { Request } from 'express';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';
import { CreateVNPayUrlDto } from './dto/create-order.dto';
import { VNPayService } from './vnpay.service';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('payments/vnpay')
export class VNPayController {
  constructor(private readonly vnPayService: VNPayService) {}

  /**
   * POST /payments/vnpay/create-url
   * Yêu cầu đăng nhập, body chỉ nhận { order_id }
   * Kiểm tra quyền sở hữu, phương thức thanh toán VNPay, trạng thái PENDING_PAYMENT / PAYMENT_FAILED
   * Sinh vnp_TxnRef mới mỗi lần thử (chỉ chữ số), lưu vào orders.vnpay_txn_ref
   * Reset PAYMENT_FAILED -> PENDING_PAYMENT
   */
  @Post('create-url')
  @UseGuards(SupabaseAuthGuard)
  @HttpCode(HttpStatus.OK)
  async createPaymentUrl(
    @Req() req: RequestWithUser,
    @Body() dto: CreateVNPayUrlDto,
  ) {
    const rawIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket?.remoteAddress ||
      '127.0.0.1';
    const clientIp = (rawIp ? String(rawIp).split(',')[0] : '127.0.0.1')!.trim();

    return await this.vnPayService.createPaymentUrl(
      req.user,
      dto.order_id,
      clientIp,
    );
  }

  /**
   * GET /payments/vnpay/verify
   * Callback trả về từ cổng thanh toán VNPay trên trình duyệt của người dùng
   * Kiểm tra chữ ký HMAC-SHA512, đối chiếu số tiền, tìm đơn hàng theo TxnRef
   * Idempotent: nếu đơn đã PAID trả về kết quả cũ, không tạo thêm notification
   * Cập nhật DB: PAID -> PROCESSING, paid_at, transaction_no / PAYMENT_FAILED
   * Response trả về kết quả kèm thông tin order
   */
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async verifyPayment(@Query() query: Record<string, any>) {
    return await this.vnPayService.verifyPayment(query);
  }

  /**
   * GET /payments/vnpay/ipn
   * Webhook server-to-server từ cổng VNPay để cập nhật thanh toán tự động
   * Dùng chung hàm xử lý với verify
   * Phản hồi định dạng chuẩn VNPay: { RspCode: '00', Message: 'Confirm Success' }
   */
  @Get('ipn')
  @HttpCode(HttpStatus.OK)
  async handleIpn(@Query() query: Record<string, any>) {
    return await this.vnPayService.processIpn(query);
  }
}
