import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { VnpayService } from './vnpay.service';

@Module({
  controllers: [PaymentsController],
  providers: [VnpayService],
})
export class PaymentsModule {}
