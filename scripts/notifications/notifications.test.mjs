import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NestFactory } from '@nestjs/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const apiDist = path.join(rootDir, 'apps/api/dist');

const toUrl = (p) => pathToFileURL(path.join(apiDist, p)).href;

// Load compiled Nest modules
const { AppModule } = await import(toUrl('app.module.js'));
const { NotificationsService } = await import(toUrl('modules/notifications/notifications.service.js'));
const { NotificationsController } = await import(toUrl('modules/notifications/notifications.controller.js'));
const { SupabaseService } = await import(toUrl('database/supabase/supabase.service.js'));

test('Notifications API Integration Tests (Task 2.3)', async (t) => {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const notifService = app.get(NotificationsService);
  const notifController = app.get(NotificationsController);
  const supabaseService = app.get(SupabaseService);
  const client = supabaseService.getClient();

  // Test users
  const user1 = {
    id: '4b652479-40b3-4eb2-b7d3-aeefda7c5135',
    email: 'haitran@example.com',
    app_metadata: { role: 'customer' },
  };

  const user2 = {
    id: '95c68847-7a28-464d-b524-0d4efa5b113d',
    email: 'admin@reeco.vn',
    app_metadata: { role: 'admin' },
  };

  const createdNotifIds = [];

  t.afterEach(async () => {
    if (createdNotifIds.length > 0) {
      await client.from('notifications').delete().in('id', createdNotifIds);
      createdNotifIds.length = 0;
    }
  });

  t.after(async () => {
    await app.close();
  });

  await t.test('NotificationsService.create inserts notification', async () => {
    const notif = await notifService.create({
      customer_id: user1.id,
      type: 'ORDER_STATUS_CHANGED',
      title: 'Đơn hàng đã được xác nhận',
      message: 'Đơn hàng REECO-9999 của bạn đã được tiếp nhận.',
    });

    assert.ok(notif.id);
    createdNotifIds.push(notif.id);
    assert.equal(notif.customer_id, user1.id);
    assert.equal(notif.type, 'ORDER_STATUS_CHANGED');
    assert.equal(notif.read_at, null);
    assert.equal(notif.is_read, false);
  });

  await t.test('GET /notifications/me: customer isolation and unread_only filtering', async () => {
    // Create 2 notifs for user1 (1 read, 1 unread)
    const n1 = await notifService.create({
      customer_id: user1.id,
      type: 'ORDER_STATUS_CHANGED',
      title: 'Thông báo 1 (Chưa đọc)',
      message: 'Nội dung thông báo 1',
    });
    createdNotifIds.push(n1.id);

    const n2 = await notifService.create({
      customer_id: user1.id,
      type: 'PAYMENT_UPDATED',
      title: 'Thông báo 2 (Đã đọc)',
      message: 'Nội dung thông báo 2',
    });
    createdNotifIds.push(n2.id);

    // Mark n2 as read
    await notifController.markAsRead({ user: user1 }, n2.id);

    // Create 1 notif for user2
    const n3 = await notifService.create({
      customer_id: user2.id,
      type: 'ORDER_STATUS_CHANGED',
      title: 'Thông báo của User 2',
      message: 'Nội dung user 2',
    });
    createdNotifIds.push(n3.id);

    // 1. User1 gets all notifications: must contain n1 and n2, but NEVER n3
    const user1All = await notifController.getMyNotifications({ user: user1 });
    assert.ok(Array.isArray(user1All.items));
    assert.ok(user1All.items.some((i) => i.id === n1.id));
    assert.ok(user1All.items.some((i) => i.id === n2.id));
    assert.ok(!user1All.items.some((i) => i.id === n3.id), 'Must not leak other users notifications');
    assert.ok(user1All.unread_count >= 1);

    // 2. User1 gets unread only: must contain n1, but NOT n2
    const user1Unread = await notifController.getMyNotifications({ user: user1 }, 'true');
    assert.ok(user1Unread.items.some((i) => i.id === n1.id));
    assert.ok(!user1Unread.items.some((i) => i.id === n2.id), 'Unread filter must exclude read notifications');
    assert.ok(user1Unread.items.length >= 1);
  });

  await t.test('PATCH /notifications/:id/read: marks as read & prevents cross-user access', async () => {
    const notif = await notifService.create({
      customer_id: user1.id,
      type: 'ORDER_STATUS_CHANGED',
      title: 'Cần đánh dấu đọc',
      message: 'Nội dung test read',
    });
    createdNotifIds.push(notif.id);

    // User 2 attempts to mark User 1's notification as read -> should fail with 404
    await assert.rejects(
      async () => {
        await notifController.markAsRead({ user: user2 }, notif.id);
      },
      { name: 'NotFoundException' },
      'Cannot mark another users notification as read',
    );

    // User 1 marks own notification as read -> succeeds
    const updated = await notifController.markAsRead({ user: user1 }, notif.id);
    assert.ok(updated.read_at);
    assert.equal(updated.is_read, true);
  });

  await t.test('POST /notifications/read-all: marks all unread notifications as read', async () => {
    const n1 = await notifService.create({
      customer_id: user1.id,
      type: 'ORDER_STATUS_CHANGED',
      title: 'Chưa đọc A',
      message: 'Msg A',
    });
    const n2 = await notifService.create({
      customer_id: user1.id,
      type: 'ORDER_STATUS_CHANGED',
      title: 'Chưa đọc B',
      message: 'Msg B',
    });
    createdNotifIds.push(n1.id, n2.id);

    // Before read-all: unread_count is at least 2
    const before = await notifController.getMyNotifications({ user: user1 }, 'true');
    assert.ok(before.items.length >= 2);

    // Execute read-all
    const res = await notifController.markAllAsRead({ user: user1 });
    assert.equal(res.success, true);
    assert.ok(res.updated_count >= 2);

    // After read-all: unread_count is 0
    const after = await notifController.getMyNotifications({ user: user1 }, 'true');
    assert.equal(after.items.length, 0);
    assert.equal(after.unread_count, 0);
  });
});
