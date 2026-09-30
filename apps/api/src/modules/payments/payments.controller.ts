import { BadRequestException, Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { VnpayService } from './vnpay.service';

const clientIp = (request: Request): string => {
  const ip = (request.ip ?? '').replace(/^::ffff:/u, '');
  return !ip || ip === '::1' ? '127.0.0.1' : ip;
};

@Controller('payments/vnpay')
export class PaymentsController {
  constructor(private readonly vnpay: VnpayService) {}

  @Post('create-url')
  createUrl(
    @Body() body: { order_id?: unknown; amount_vnd?: unknown },
    @Req() request: Request,
  ) {
    const orderId = String(body?.order_id ?? '');
    const amountVnd = Number(body?.amount_vnd);
    if (!/^[A-Za-z0-9]{1,40}$/u.test(orderId)) {
      throw new BadRequestException('order_id must be alphanumeric');
    }
    // VNPay accepts whole đồng from 5,000 to under 1 billion VND per transaction
    if (!Number.isInteger(amountVnd) || amountVnd < 5_000 || amountVnd >= 1_000_000_000) {
      throw new BadRequestException('amount_vnd must be an integer from 5,000 to 999,999,999');
    }
    return this.vnpay.createPaymentUrl({
      orderId,
      amountVnd,
      ipAddr: clientIp(request),
    });
  }

  // The client forwards the query string VNPay appended to the return URL.
  @Get('verify')
  verify(@Query() query: Record<string, unknown>) {
    return this.vnpay.verifyReturn(query);
  }
}
