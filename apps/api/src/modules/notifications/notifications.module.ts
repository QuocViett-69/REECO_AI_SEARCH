import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../database/supabase/supabase.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsRepository } from './notifications.repository';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [SupabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
