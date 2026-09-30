import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../database/supabase/supabase.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminOrdersController } from './admin-orders.controller';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';
import { OrdersService } from './orders.service';
import { VNPayController } from './vnpay.controller';
import { VNPayService } from './vnpay.service';

@Module({
  imports: [SupabaseModule, NotificationsModule],
  controllers: [OrdersController, AdminOrdersController, VNPayController],
  providers: [OrdersService, OrdersRepository, VNPayService],
  exports: [OrdersService, OrdersRepository, VNPayService],
})
export class OrdersModule {}
