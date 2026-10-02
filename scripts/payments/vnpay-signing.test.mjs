import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import test from 'node:test';

process.env.VNPAY_TMN_CODE = 'TESTCODE';
process.env.VNPAY_HASH_SECRET = 'TESTSECRET';

const require = createRequire(import.meta.url);
const { VnpayService, formatVnpDate } = require(path.resolve(import.meta.dirname, '../../apps/api/dist/modules/payments/vnpay.service.js'));
const service = new VnpayService();

const returnQuery = (paymentUrl, overrides = {}) => {
  const params = Object.fromEntries(new URL(paymentUrl).searchParams);
  const { vnp_SecureHash, ...rest } = params;
  // Simulate VNPay's return: it signs its own response fields with the same secret.
  const response = {
    ...rest,
    vnp_ResponseCode: '00',
    vnp_TransactionStatus: '00',
    vnp_TransactionNo: '14000000',
    vnp_BankCode: 'NCB',
    ...overrides,
  };
  delete response.vnp_Version; delete response.vnp_Command; delete response.vnp_CurrCode;
  delete response.vnp_ReturnUrl; delete response.vnp_IpAddr; delete response.vnp_CreateDate;
  delete response.vnp_ExpireDate; delete response.vnp_Locale; delete response.vnp_OrderType;
  const { signVnp } = require(path.resolve(import.meta.dirname, '../../apps/api/dist/modules/payments/vnpay.service.js'));
  return { ...response, vnp_SecureHash: signVnp(response, 'TESTSECRET') };
};

test('formats dates in GMT+7', () => {
  assert.equal(formatVnpDate(new Date('2026-09-29T17:30:05Z')), '20260930003005');
});

test('builds a signed sandbox URL with VND amount x100', () => {
  const { payment_url, amount_vnd, txn_ref } = service.createPaymentUrl({
    orderId: '1002', amountVnd: 262500, ipAddr: '127.0.0.1', now: new Date('2026-09-29T00:00:00Z'),
  });
  const url = new URL(payment_url);
  assert.equal(url.origin + url.pathname, 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
  assert.equal(amount_vnd, 262500);
  assert.equal(url.searchParams.get('vnp_Amount'), '26250000');
  assert.equal(url.searchParams.get('vnp_TmnCode'), 'TESTCODE');
  assert.equal(url.searchParams.get('vnp_TxnRef'), txn_ref);
  assert.match(url.searchParams.get('vnp_SecureHash'), /^[0-9a-f]{128}$/);
});

test('accepts a correctly signed successful return', () => {
  const { payment_url } = service.createPaymentUrl({ orderId: '1002', amountVnd: 250000, ipAddr: '127.0.0.1' });
  const result = service.verifyReturn(returnQuery(payment_url));
  assert.equal(result.valid, true);
  assert.equal(result.success, true);
  assert.equal(result.order_id, '1002');
  assert.equal(result.amount_vnd, 250000);
});

test('reports cancelled payments as valid but unsuccessful', () => {
  const { payment_url } = service.createPaymentUrl({ orderId: '1002', amountVnd: 250000, ipAddr: '127.0.0.1' });
  const result = service.verifyReturn(returnQuery(payment_url, { vnp_ResponseCode: '24', vnp_TransactionStatus: '02' }));
  assert.equal(result.valid, true);
  assert.equal(result.success, false);
  assert.equal(result.response_code, '24');
});

test('rejects tampered amounts', () => {
  const { payment_url } = service.createPaymentUrl({ orderId: '1002', amountVnd: 250000, ipAddr: '127.0.0.1' });
  const query = returnQuery(payment_url);
  query.vnp_Amount = '100';
  const result = service.verifyReturn(query);
  assert.equal(result.valid, false);
  assert.equal(result.success, false);
});
