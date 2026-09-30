import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import { NestFactory } from '@nestjs/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const apiDist = path.join(rootDir, 'apps/api/dist');

const toUrl = (p) => pathToFileURL(path.join(apiDist, p)).href;

// Load compiled Nest modules
const { AppModule } = await import(toUrl('app.module.js'));
const { OrdersService } = await import(toUrl('modules/orders/orders.service.js'));
const { OrdersRepository } = await import(toUrl('modules/orders/orders.repository.js'));
const { VNPayService } = await import(toUrl('modules/orders/vnpay.service.js'));
const { VNPayController } = await import(toUrl('modules/orders/vnpay.controller.js'));
const { SupabaseService } = await import(toUrl('database/supabase/supabase.service.js'));

test('VNPay Payment Integration Tests (Task 2.2)', async (t) => {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const ordersService = app.get(OrdersService);
  const ordersRepo = app.get(OrdersRepository);
  const vnpayService = app.get(VNPayService);
  const vnpayController = app.get(VNPayController);
  const supabaseService = app.get(SupabaseService);
  const client = supabaseService.getClient();

  // Test users from Supabase Auth
  const customerUser = {
    id: '4b652479-40b3-4eb2-b7d3-aeefda7c5135',
    email: 'haitran@example.com',
    app_metadata: { role: 'customer' },
  };

  const adminUser = {
    id: '95c68847-7a28-464d-b524-0d4efa5b113d',
    email: 'admin@reeco.vn',
    app_metadata: { role: 'admin' },
  };

  const otherUser = {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'other@example.com',
    app_metadata: { role: 'customer' },
  };

  // Get active product for testing
  const { data: prods } = await client.from('products').select('product_id').eq('status', 'active').limit(1);
  assert.ok(prods && prods.length > 0, 'Active product required for test');
  const testPid = prods[0].product_id;

  let testOrder = null;

  t.afterEach(async () => {
    if (testOrder?.id) {
      await client.from('notifications').delete().eq('order_id', testOrder.id);
      await client.from('order_status_history').delete().eq('order_id', testOrder.id);
      await client.from('order_items').delete().eq('order_id', testOrder.id);
      await client.from('orders').delete().eq('id', testOrder.id);
      testOrder = null;
    }
  });

  t.after(async () => {
    await app.close();
  });

  await t.test('POST /payments/vnpay/create-url: validation, digit-only txn_ref, and URL generation', async () => {
    // 1. Create VNPay order
    testOrder = await ordersService.createOrder(customerUser, {
      items: [{ product_id: testPid, quantity: 1 }],
      payment_method: 'vnpay',
      shipping_method: 'standard',
      customer_name: 'Hai Tran',
      customer_email: 'haitran@example.com',
      customer_phone: '0901234567',
      shipping_address: '128 Nguyen Van Thu',
      city: 'TP. Ho Chi Minh',
    });

    assert.equal(testOrder.status, 'PENDING_PAYMENT');
    assert.equal(testOrder.payment_status, 'PENDING_PAYMENT');
    assert.equal(testOrder.payment_method, 'vnpay');

    // 2. Reject non-owner
    await assert.rejects(
      async () => {
        await vnpayService.createPaymentUrl(otherUser, testOrder.id);
      },
      { name: 'NotFoundException' },
      'Non-owner should receive 404',
    );

    // 3. Create payment URL
    const result = await vnpayService.createPaymentUrl(customerUser, testOrder.id, '127.0.0.1');
    assert.ok(result.payment_url, 'Payment URL must be returned');
    assert.ok(result.payment_url.startsWith('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?'), 'Must point to sandbox');

    // 4. Validate txn_ref: must be strictly digits
    assert.ok(/^\d+$/.test(result.txn_ref), `txn_ref "${result.txn_ref}" must only contain digits`);

    // 5. Verify vnpay_txn_ref is persisted in DB
    const persisted = await ordersRepo.findOrderByTxnRef(result.txn_ref);
    assert.ok(persisted, 'Order must be queryable by vnpay_txn_ref');
    assert.equal(persisted.id, testOrder.id);
    assert.equal(persisted.vnpay_txn_ref, result.txn_ref);

    // 6. Verify URL params and amount
    const parsedUrl = new URL(result.payment_url);
    const amountInUrl = parsedUrl.searchParams.get('vnp_Amount');
    assert.equal(amountInUrl, String(Math.round(testOrder.total * 100)), 'vnp_Amount must equal order.total * 100');
    assert.equal(parsedUrl.searchParams.get('vnp_CurrCode'), 'VND');
    assert.equal(parsedUrl.searchParams.get('vnp_TxnRef'), result.txn_ref);
    assert.ok(parsedUrl.searchParams.get('vnp_SecureHash'), 'Must contain signature');
  });

  await t.test('POST /payments/vnpay/create-url: reset PAYMENT_FAILED -> PENDING_PAYMENT', async () => {
    testOrder = await ordersService.createOrder(customerUser, {
      items: [{ product_id: testPid, quantity: 1 }],
      payment_method: 'vnpay',
      shipping_method: 'standard',
      customer_name: 'Hai Tran',
      customer_email: 'haitran@example.com',
      customer_phone: '0901234567',
      shipping_address: '128 Nguyen Van Thu',
      city: 'TP. Ho Chi Minh',
    });

    // Manually transition to PAYMENT_FAILED
    await client.from('orders').update({ status: 'PAYMENT_FAILED', payment_status: 'FAILED' }).eq('id', testOrder.id);

    // Create payment URL again: should reset to PENDING_PAYMENT
    const result = await vnpayService.createPaymentUrl(customerUser, testOrder.id);
    assert.ok(/^\d+$/.test(result.txn_ref));

    const refreshed = await ordersRepo.findOrderByIdentifier(testOrder.id);
    assert.equal(refreshed.status, 'PENDING_PAYMENT', 'Status must be reset from PAYMENT_FAILED to PENDING_PAYMENT');
    assert.equal(refreshed.payment_status, 'PENDING_PAYMENT');
  });

  await t.test('GET /payments/vnpay/verify: successful payment, history, and notifications', async () => {
    testOrder = await ordersService.createOrder(customerUser, {
      items: [{ product_id: testPid, quantity: 1 }],
      payment_method: 'vnpay',
      shipping_method: 'standard',
      customer_name: 'Hai Tran',
      customer_email: 'haitran@example.com',
      customer_phone: '0901234567',
      shipping_address: '128 Nguyen Van Thu',
      city: 'TP. Ho Chi Minh',
    });

    const urlResult = await vnpayService.createPaymentUrl(customerUser, testOrder.id);
    const txnRef = urlResult.txn_ref;
    const vnpAmount = String(Math.round(testOrder.total * 100));
    const transactionNo = '14892834';

    // Simulate VNPay return query parameters
    const mockParams = {
      vnp_Amount: vnpAmount,
      vnp_BankCode: 'NCB',
      vnp_BankTranNo: 'VNP14892834',
      vnp_CardType: 'ATM',
      vnp_OrderInfo: `Thanh toan don hang ${testOrder.order_code}`,
      vnp_PayDate: vnpayService.getVietnamDateTime(),
      vnp_ResponseCode: '00',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'BHX8TBS6',
      vnp_TransactionNo: transactionNo,
      vnp_TransactionStatus: '00',
      vnp_TxnRef: txnRef,
    };

    const secureHash = vnpayService.calculateSignature(mockParams);
    const callbackQuery = { ...mockParams, vnp_SecureHash: secureHash };

    // Execute verify
    const verifyResult = await vnpayService.verifyPayment(callbackQuery);
    assert.equal(verifyResult.success, true);
    assert.equal(verifyResult.order.status, 'PROCESSING');
    assert.equal(verifyResult.order.payment_status, 'PAID');
    assert.equal(verifyResult.order.vnpay_transaction_no, transactionNo);
    assert.ok(verifyResult.order.paid_at);

    // Verify DB records: order_status_history & notifications
    const { data: history } = await client.from('order_status_history').select('*').eq('order_id', testOrder.id);
    assert.ok(history.some((h) => h.to_status === 'PROCESSING'), 'History for PROCESSING must exist');

    const { data: notifications } = await client.from('notifications').select('*').eq('order_id', testOrder.id);
    assert.ok(notifications.some((n) => n.type === 'ORDER_STATUS_CHANGED'), 'ORDER_STATUS_CHANGED notification must exist');
    assert.ok(notifications.some((n) => n.type === 'PAYMENT_UPDATED'), 'PAYMENT_UPDATED notification must exist');
  });

  await t.test('GET /payments/vnpay/verify: idempotent when order already PAID', async () => {
    testOrder = await ordersService.createOrder(customerUser, {
      items: [{ product_id: testPid, quantity: 1 }],
      payment_method: 'vnpay',
      shipping_method: 'standard',
      customer_name: 'Hai Tran',
      customer_email: 'haitran@example.com',
      customer_phone: '0901234567',
      shipping_address: '128 Nguyen Van Thu',
      city: 'TP. Ho Chi Minh',
    });

    const urlResult = await vnpayService.createPaymentUrl(customerUser, testOrder.id);
    const txnRef = urlResult.txn_ref;
    const vnpAmount = String(Math.round(testOrder.total * 100));

    const mockParams = {
      vnp_Amount: vnpAmount,
      vnp_OrderInfo: `Thanh toan don hang ${testOrder.order_code}`,
      vnp_PayDate: vnpayService.getVietnamDateTime(),
      vnp_ResponseCode: '00',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'BHX8TBS6',
      vnp_TransactionNo: '14892835',
      vnp_TxnRef: txnRef,
    };
    const secureHash = vnpayService.calculateSignature(mockParams);
    const callbackQuery = { ...mockParams, vnp_SecureHash: secureHash };

    // 1st verify: success
    const firstVerify = await vnpayService.verifyPayment(callbackQuery);
    assert.equal(firstVerify.success, true);

    const { count: historyCountBefore } = await client
      .from('order_status_history')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', testOrder.id);

    const { count: notifCountBefore } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', testOrder.id);

    // 2nd verify: idempotent (should not insert any new history or notifications)
    const secondVerify = await vnpayService.verifyPayment(callbackQuery);
    assert.equal(secondVerify.success, true);
    assert.equal(secondVerify.is_already_paid, true);

    const { count: historyCountAfter } = await client
      .from('order_status_history')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', testOrder.id);

    const { count: notifCountAfter } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', testOrder.id);

    assert.equal(historyCountAfter, historyCountBefore, 'Idempotent verify must not add history entries');
    assert.equal(notifCountAfter, notifCountBefore, 'Idempotent verify must not add notifications');
  });

  await t.test('GET /payments/vnpay/verify: invalid signature rejected with 400', async () => {
    testOrder = await ordersService.createOrder(customerUser, {
      items: [{ product_id: testPid, quantity: 1 }],
      payment_method: 'vnpay',
      shipping_method: 'standard',
      customer_name: 'Hai Tran',
      customer_email: 'haitran@example.com',
      customer_phone: '0901234567',
      shipping_address: '128 Nguyen Van Thu',
      city: 'TP. Ho Chi Minh',
    });

    const urlResult = await vnpayService.createPaymentUrl(customerUser, testOrder.id);

    const callbackQuery = {
      vnp_Amount: String(Math.round(testOrder.total * 100)),
      vnp_ResponseCode: '00',
      vnp_TxnRef: urlResult.txn_ref,
      vnp_SecureHash: 'INVALID_HASH_VALUE_TAMPERED',
    };

    await assert.rejects(
      async () => {
        await vnpayService.verifyPayment(callbackQuery);
      },
      { name: 'BadRequestException' },
      'Invalid hash must be rejected with 400',
    );
  });

  await t.test('GET /payments/vnpay/ipn: format standard VNPay response', async () => {
    testOrder = await ordersService.createOrder(customerUser, {
      items: [{ product_id: testPid, quantity: 1 }],
      payment_method: 'vnpay',
      shipping_method: 'standard',
      customer_name: 'Hai Tran',
      customer_email: 'haitran@example.com',
      customer_phone: '0901234567',
      shipping_address: '128 Nguyen Van Thu',
      city: 'TP. Ho Chi Minh',
    });

    const urlResult = await vnpayService.createPaymentUrl(customerUser, testOrder.id);
    const mockParams = {
      vnp_Amount: String(Math.round(testOrder.total * 100)),
      vnp_OrderInfo: `Thanh toan don hang ${testOrder.order_code}`,
      vnp_PayDate: vnpayService.getVietnamDateTime(),
      vnp_ResponseCode: '00',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'BHX8TBS6',
      vnp_TransactionNo: '14892836',
      vnp_TxnRef: urlResult.txn_ref,
    };
    const secureHash = vnpayService.calculateSignature(mockParams);

    // 1. IPN with wrong signature -> RspCode 97
    const badIpn = await vnpayService.processIpn({ ...mockParams, vnp_SecureHash: 'wrong' });
    assert.equal(badIpn.RspCode, '97');

    // 2. IPN with valid signature -> RspCode 00
    const goodIpn = await vnpayService.processIpn({ ...mockParams, vnp_SecureHash: secureHash });
    assert.equal(goodIpn.RspCode, '00');

    // 3. Repeat IPN on already confirmed order -> RspCode 02
    const repeatIpn = await vnpayService.processIpn({ ...mockParams, vnp_SecureHash: secureHash });
    assert.equal(repeatIpn.RspCode, '02');
  });
});
