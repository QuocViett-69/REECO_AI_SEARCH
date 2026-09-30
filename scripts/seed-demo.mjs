// ─── REECO Demo Seed Script ───────────────────────────────────────────────────
// Tạo dữ liệu mẫu phục vụ kiểm thử và kịch bản demo hệ thống.
// Hàm cuối: seedDemoOrders() tạo 3 đơn hàng demo cho haitran với ghi chú notes='[demo-seed]'
// Chạy lại không bị trùng (Idempotent).

import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { NestFactory } from '@nestjs/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const apiDist = path.join(rootDir, 'apps/api/dist');
const toUrl = (p) => pathToFileURL(path.join(apiDist, p)).href;

// Tự động nạp biến môi trường từ apps/api/.env nếu chưa có
if (!process.env.SUPABASE_URL) {
  try {
    process.loadEnvFile(path.join(rootDir, 'apps/api/.env'));
  } catch {}
}

const { AppModule } = await import(toUrl('app.module.js'));
const { OrdersService } = await import(toUrl('modules/orders/orders.service.js'));
const { SupabaseService } = await import(toUrl('database/supabase/supabase.service.js'));

export const DEMO_CUSTOMER_USER = {
  id: '4b652479-40b3-4eb2-b7d3-aeefda7c5135',
  email: 'haitran@example.com',
  name: 'Hai Tran',
  phone: '+84 908 123 456',
  app_metadata: { role: 'customer' },
};

/**
 * Thêm 3 đơn hàng demo cho khách hàng haitran:
 * 1. PROCESSING - Thanh toán khi nhận hàng (COD), payment_status = COD_PENDING
 * 2. SHIPPED - VNPay đã thanh toán (PAID), vnpay_transaction_no, paid_at
 * 3. PENDING_PAYMENT - VNPay chờ thanh toán, payment_status = PENDING_PAYMENT
 *
 * Ghi chú notes='[demo-seed]'
 * Đảm bảo tính Idempotency: Kiểm tra đơn đã tồn tại trước khi tạo, chạy lại không trùng lặp.
 */
export async function seedDemoOrders(providedApp = null) {
  let app = providedApp;
  let shouldCloseApp = false;

  if (!app) {
    app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    shouldCloseApp = true;
  }

  const ordersService = app.get(OrdersService);
  const supabaseService = app.get(SupabaseService);
  const client = supabaseService.getClient();

  console.log('─── Bắt đầu khởi tạo dữ liệu đơn hàng demo cho khách hàng haitran ───');

  // 1. Kiểm tra danh sách đơn demo-seed đã có của haitran
  const { data: existingSeedOrders, error: fetchErr } = await client
    .from('orders')
    .select('id, order_code, status, payment_method, payment_status, notes')
    .eq('customer_id', DEMO_CUSTOMER_USER.id)
    .eq('notes', '[demo-seed]');

  if (fetchErr) {
    console.error('Lỗi kiểm tra đơn hàng cũ:', fetchErr.message);
    if (shouldCloseApp) await app.close();
    throw fetchErr;
  }

  const existingMap = new Set(
    (existingSeedOrders || []).map((o) => `${o.status}_${o.payment_method}`)
  );

  const orderConfigs = [
    {
      label: 'Đơn 1: COD - PROCESSING',
      targetStatus: 'PROCESSING',
      paymentMethod: 'cod',
      shippingMethod: 'standard',
      items: [{ product_id: 'CSI_CS655', quantity: 2 }],
      applyPostUpdates: null,
    },
    {
      label: 'Đơn 2: VNPay - SHIPPED (Đã thanh toán)',
      targetStatus: 'SHIPPED',
      paymentMethod: 'vnpay',
      shippingMethod: 'express',
      items: [{ product_id: 'CSI_TEMPVUE20_S', quantity: 1 }],
      applyPostUpdates: async (createdOrder) => {
        const paidTime = new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString();
        const shippedTime = new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString();
        const txnNo = '14589230';

        // Cập nhật trạng thái thanh toán và vận chuyển
        await client
          .from('orders')
          .update({
            status: 'SHIPPED',
            payment_status: 'PAID',
            paid_at: paidTime,
            vnpay_transaction_no: txnNo,
            updated_at: shippedTime,
          })
          .eq('id', createdOrder.id);

        // Ghi nhận lịch sử trạng thái theo đúng tiến trình
        await client.from('order_status_history').insert([
          {
            order_id: createdOrder.id,
            status: 'PAID',
            previous_status: 'PENDING_PAYMENT',
            changed_by: 'vnpay',
            note: 'VNPay Sandbox xác nhận thanh toán thành công',
            created_at: paidTime,
          },
          {
            order_id: createdOrder.id,
            status: 'PROCESSING',
            previous_status: 'PAID',
            changed_by: 'system',
            note: 'Chuyển xử lý tại kho REECO',
            created_at: paidTime,
          },
          {
            order_id: createdOrder.id,
            status: 'SHIPPED',
            previous_status: 'PROCESSING',
            changed_by: 'admin',
            note: 'Đơn hàng đã bàn giao đơn vị vận chuyển hàng không',
            created_at: shippedTime,
          },
        ]);
      },
    },
    {
      label: 'Đơn 3: VNPay - PENDING_PAYMENT (Chờ thanh toán)',
      targetStatus: 'PENDING_PAYMENT',
      paymentMethod: 'vnpay',
      shippingMethod: 'standard',
      items: [{ product_id: 'CSI_CS650', quantity: 1 }],
      applyPostUpdates: null,
    },
  ];

  const results = [];

  for (const cfg of orderConfigs) {
    const key = `${cfg.targetStatus}_${cfg.paymentMethod}`;
    if (existingMap.has(key)) {
      const match = existingSeedOrders.find(
        (o) => o.status === cfg.targetStatus && o.payment_method === cfg.paymentMethod
      );
      console.log(`✓ [ĐÃ TỒN TẠI] ${cfg.label}: ${match?.order_code || match?.id} (Bỏ qua không tạo trùng)`);
      results.push(match);
      continue;
    }

    try {
      // Tạo đơn hàng chuẩn qua OrdersService
      const created = await ordersService.createOrder(
        {
          id: DEMO_CUSTOMER_USER.id,
          email: DEMO_CUSTOMER_USER.email,
          app_metadata: DEMO_CUSTOMER_USER.app_metadata,
        },
        {
          items: cfg.items,
          shipping_method: cfg.shippingMethod,
          payment_method: cfg.paymentMethod,
          customer_name: DEMO_CUSTOMER_USER.name,
          customer_email: DEMO_CUSTOMER_USER.email,
          customer_phone: DEMO_CUSTOMER_USER.phone,
          shipping_address: '128 Nguyễn Văn Thủ, Phường Đa Kao, Quận 1',
          city: 'Thành phố Hồ Chí Minh',
          province: 'Hồ Chí Minh',
          country: 'Vietnam',
          postal_code: '700000',
          notes: '[demo-seed]',
        }
      );

      // Áp dụng cập nhật bổ sung (nếu có)
      if (cfg.applyPostUpdates) {
        await cfg.applyPostUpdates(created);
      }

      console.log(`+ [TẠO MỚI] ${cfg.label}: ${created.order_code} (Tổng tiền: ${created.total.toLocaleString('vi-VN')} ₫)`);
      results.push(created);
    } catch (err) {
      console.error(`x [LỖI] ${cfg.label}:`, err.message);
    }
  }

  console.log(`─── Hoàn tất: 3 đơn hàng demo cho haitran đã sẵn sàng ───`);

  if (shouldCloseApp) {
    await app.close();
  }

  return results;
}

// Cho phép chạy trực tiếp từ dòng lệnh: node scripts/seed-demo.mjs
const isDirectExecution =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectExecution) {
  seedDemoOrders().catch((err) => {
    console.error('Lỗi thực thi seed demo:', err);
    process.exitCode = 1;
  });
}
