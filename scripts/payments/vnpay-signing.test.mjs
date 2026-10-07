// Signing and verification of the live VNPay integration (apps/api/src/modules/orders/vnpay.service.ts).
// Runs against the compiled API with env stubs; no network or database access.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

process.env.VNPAY_TMN_CODE = 'TESTCODE';
process.env.VNPAY_HASH_SECRET = 'TESTSECRET';
delete process.env.VNPAY_PAY_URL;

const require = createRequire(import.meta.url);
const { VNPayService, formatVnpDate } = require(
  path.resolve(import.meta.dirname, '../../apps/api/dist/modules/orders/vnpay.service.js'),
);

const customer = { id: 'customer-1', app_metadata: { role: 'customer' } };
const pendingOrder = {
  id: 'order-uuid', order_number: 1002, order_code: 'REECO-1002', customer_id: 'customer-1',
  payment_method: 'vnpay', status: 'PENDING_PAYMENT', payment_status: 'PENDING_PAYMENT', total: 262500,
};

function serviceFor(order = pendingOrder) {
  const saved = [];
  const repository = {
    findOrderByIdentifier: async () => order,
    updateOrderTxnRef: async (...args) => { saved.push(args); },
  };
  return { service: new VNPayService(repository), saved };
}

// What VNPay sends back: its own response fields, signed with the shared secret.
function signedReturn(service, overrides = {}) {
  const params = {
    vnp_Amount: '26250000',
    vnp_BankCode: 'NCB',
    vnp_OrderInfo: 'Thanh toan don hang REECO-1002',
    vnp_ResponseCode: '00',
    vnp_TmnCode: 'TESTCODE',
    vnp_TransactionNo: '14000000',
    vnp_TransactionStatus: '00',
    vnp_TxnRef: '10021727600000123',
    ...overrides,
  };
  return { ...params, vnp_SecureHash: service.calculateSignature(params) };
}

test('formats dates in GMT+7', () => {
  assert.equal(formatVnpDate(new Date('2026-09-29T17:30:05Z')), '20260930003005');
});

test('builds a signed sandbox URL with VND amount x100 and a 15-minute expiry', async () => {
  const { service, saved } = serviceFor();
  const { payment_url, txn_ref, order_id } = await service.createPaymentUrl(customer, 'REECO-1002', '127.0.0.1');
  const url = new URL(payment_url);
  assert.equal(url.origin + url.pathname, 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
  assert.equal(order_id, 'order-uuid');
  assert.equal(url.searchParams.get('vnp_Amount'), '26250000');
  assert.equal(url.searchParams.get('vnp_TmnCode'), 'TESTCODE');
  assert.equal(url.searchParams.get('vnp_TxnRef'), txn_ref);
  assert.match(txn_ref, /^1002\d+$/);
  assert.match(url.searchParams.get('vnp_SecureHash'), /^[0-9a-f]{128}$/);
  const created = url.searchParams.get('vnp_CreateDate');
  const expires = url.searchParams.get('vnp_ExpireDate');
  assert.match(expires, /^\d{14}$/);
  assert.ok(Number(expires) > Number(created));
  assert.deepEqual(saved, [['order-uuid', txn_ref, false]], 'the txn ref is stored on the order');
});

test('the payment URL signature verifies with the same secret', async () => {
  const { service } = serviceFor();
  const { payment_url } = await service.createPaymentUrl(customer, 'REECO-1002');
  const params = Object.fromEntries(new URL(payment_url).searchParams);
  assert.equal(service.verifySignature(params), true);
});

test('accepts a correctly signed return and rejects any tampering', () => {
  const { service } = serviceFor();
  const query = signedReturn(service);
  assert.equal(service.verifySignature(query), true);
  assert.equal(service.verifySignature({ ...query, vnp_Amount: '100' }), false, 'tampered amount');
  assert.equal(service.verifySignature({ ...query, vnp_ResponseCode: '24' }), false, 'tampered result');
  assert.equal(service.verifySignature({ ...query, vnp_SecureHash: 'abc' }), false, 'malformed hash');
  assert.equal(service.verifySignature({ ...query, vnp_SecureHash: '0'.repeat(128) }), false, 'wrong hash');
});

test('refuses to create a payment for another customer or a non-VNPay order', async () => {
  await assert.rejects(
    serviceFor().service.createPaymentUrl({ id: 'someone-else', app_metadata: {} }, 'REECO-1002'),
    /Không tìm thấy/,
  );
  await assert.rejects(
    serviceFor({ ...pendingOrder, payment_method: 'cod' }).service.createPaymentUrl(customer, 'REECO-1002'),
    /không thể thanh toán qua VNPay/,
  );
  await assert.rejects(
    serviceFor({ ...pendingOrder, status: 'CANCELLED' }).service.createPaymentUrl(customer, 'REECO-1002'),
    /không thể khởi tạo thanh toán mới/,
  );
});
