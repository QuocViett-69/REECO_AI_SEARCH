import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { VNPayService } = require('../../apps/api/dist/modules/orders/vnpay.service.js');
const { OrdersRepository } = require('../../apps/api/dist/modules/orders/orders.repository.js');
const { SupabaseAuthGuard } = require('../../apps/api/dist/auth/supabase-auth.guard.js');
const { AppModule } = require('../../apps/api/dist/app.module.js');

test('only the order-backed VNPay controller is registered', () => {
  const controllers = Reflect.getMetadata('imports', AppModule)
    .flatMap(module => Reflect.getMetadata('controllers', module) || []);
  assert.equal(controllers.filter(controller => Reflect.getMetadata('path', controller) === 'payments/vnpay').length, 1);
});

test('invalid demo and forged tokens cannot bypass Supabase', async () => {
  const guard = new SupabaseAuthGuard({ isConfigured: true, getUser: async () => null });
  for (const token of ['demo-token-admin', 'reeco_admin_token_123', 'eyJhbGciOiJub25lIn0.eyJyb2xlIjoiYWRtaW4ifQ.fake']) {
    const request = { headers: { authorization: `Bearer ${token}` } };
    await assert.rejects(guard.canActivate({ switchToHttp: () => ({ getRequest: () => request }) }), /invalid or expired/);
    assert.equal(request.user, undefined);
  }
});

test('order identifiers come from the database default', async () => {
  let inserted;
  const client = { from: table => ({
    insert: record => {
      if (table === 'orders') inserted = record;
      return { select: () => table === 'orders'
        ? { single: async () => ({ data: { ...record, order_number: 1001, order_code: 'REECO-1001' } }) }
        : Promise.resolve({ data: record }) };
    },
  }) };
  const repository = new OrdersRepository({ getClient: () => client });
  const result = await repository.createOrder({ customerId: 'customer', items: [], currency: 'VND' });
  assert.equal(Object.hasOwn(inserted, 'order_number'), false);
  assert.equal(Object.hasOwn(inserted, 'order_code'), false);
  assert.equal(result.order_number, 1001);
});

test('VNPay verifies exact amounts, transaction status, ownership and repeat callbacks', async () => {
  process.env.VNPAY_TMN_CODE = 'TESTCODE';
  process.env.VNPAY_HASH_SECRET = 'TESTSECRET';
  const order = { id: 'order', order_number: 1001, customer_id: 'owner', payment_method: 'vnpay', status: 'PENDING_PAYMENT', total: 250000 };
  let successes = 0;
  let failures = 0;
  const service = new VNPayService({
    findOrderByIdentifier: async () => order,
    findOrderByTxnRef: async () => order,
    updateOrderTxnRef: async () => {},
    recordPaymentSuccess: async () => { successes++; order.payment_status = 'PAID'; return order; },
    recordPaymentFailure: async () => { failures++; return order; },
  });
  assert.equal(service.getVietnamDateTime(new Date('2026-09-29T17:30:05Z')), '20260930003005');
  await assert.rejects(service.createPaymentUrl({ id: 'other', app_metadata: {} }, 'order'));
  const url = await service.createPaymentUrl({ id: 'owner', app_metadata: {} }, 'order');
  assert.equal(new URL(url.payment_url).searchParams.get('vnp_Amount'), '25000000');
  const signed = overrides => {
    const fields = { vnp_TxnRef: url.txn_ref, vnp_Amount: '25000000', vnp_ResponseCode: '00', vnp_TransactionStatus: '00', vnp_TransactionNo: '123', ...overrides };
    return { ...fields, vnp_SecureHash: service.calculateSignature(fields) };
  };
  await assert.rejects(service.verifyPayment(signed({ vnp_Amount: '25000001' })));
  assert.equal((await service.processIpn(signed({ vnp_Amount: '25000001' }))).RspCode, '04');
  assert.equal((await service.verifyPayment(signed({ vnp_TransactionStatus: '02' }))).success, false);
  assert.equal(failures, 1);
  assert.equal(successes, 0);
  assert.equal((await service.verifyPayment(signed({}))).success, true);
  assert.equal((await service.verifyPayment(signed({}))).is_already_paid, true);
  assert.equal(successes, 1);
  assert.equal(service.verifySignature({ vnp_SecureHash: ['invalid'] }), false);
  delete process.env.VNPAY_HASH_SECRET;
  assert.throws(() => service.calculateSignature({}), /not configured/);
});
