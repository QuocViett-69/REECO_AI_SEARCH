// Regression tests for API access control, admin input validation, search rate limiting
// and VNPay state handling. Runs against the compiled API (npm run build:api); no network
// or database access.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const dist = (path) => require(`../../apps/api/dist/${path}`);
const { AdminGuard } = dist('auth/admin.guard.js');
const { SupabaseAuthGuard } = dist('auth/supabase-auth.guard.js');
const { AdminController } = dist('modules/admin/admin.controller.js');
const { ImportsController } = dist('modules/imports/imports.controller.js');
const { AdminOrdersController } = dist('modules/orders/admin-orders.controller.js');
const { AdminProductUpdateSchema, AdminProductPriceUpdateSchema } = dist('modules/admin/admin-product-update.schema.js');
const { AdminService } = dist('modules/admin/admin.service.js');
const { createRateLimit } = dist('common/middleware/rate-limit.middleware.js');
const { VNPayService } = dist('modules/orders/vnpay.service.js');
const { CreateOrderSchema, UpdateOrderStatusSchema } = dist('modules/orders/dto/create-order.dto.js');
const { OrdersRepository } = dist('modules/orders/orders.repository.js');

const contextFor = (request) => ({ switchToHttp: () => ({ getRequest: () => request }) });

test('every admin controller requires both a Supabase session and the admin role', () => {
  for (const controller of [AdminController, ImportsController, AdminOrdersController]) {
    const guards = Reflect.getMetadata('__guards__', controller) ?? [];
    assert.deepEqual(guards, [SupabaseAuthGuard, AdminGuard], controller.name);
  }
});

test('AdminGuard rejects customers and anonymous requests, admits admins', () => {
  const guard = new AdminGuard();
  assert.throws(() => guard.canActivate(contextFor({})), /Bearer access token/);
  assert.throws(
    () => guard.canActivate(contextFor({ user: { id: 'c1', app_metadata: { role: 'customer' } } })),
    /Admin/,
  );
  assert.throws(() => guard.canActivate(contextFor({ user: { id: 'c2', app_metadata: {} } })), /Admin/);
  // user_metadata is editable by the user, so it must never grant admin
  assert.throws(
    () => guard.canActivate(contextFor({ user: { id: 'c3', app_metadata: {}, user_metadata: { role: 'admin' } } })),
    /Admin/,
  );
  assert.equal(guard.canActivate(contextFor({ user: { id: 'a1', app_metadata: { role: 'admin' } } })), true);
});

test('demo catalog rejects every catalog update while price remains editable', () => {
  assert.equal(AdminProductUpdateSchema.safeParse({ price_vnd: 5000 }).success, true);
  for (const field of ['product_name_en', 'name_vi', 'category', 'subcategory', 'device_type', 'status', 'product_url', 'supported_protocols', 'specifications', 'product_id', 'model']) {
    assert.equal(AdminProductUpdateSchema.safeParse({ price_vnd: 5000, [field]: 'x' }).success, false, field);
  }
});

test('demo import is blocked before running the data pipeline', async () => {
  const { ImportsService } = dist('modules/imports/imports.service.js');
  await assert.rejects(new ImportsService().run(), error => error.getStatus() === 403);
});

test('admin price updates accept only a non-negative integer price_vnd', () => {
  assert.equal(AdminProductPriceUpdateSchema.safeParse({ price_vnd: 13_210_000 }).success, true);
  assert.equal(AdminProductPriceUpdateSchema.safeParse({ price_vnd: 0 }).success, true);
  for (const bad of [{}, { price_vnd: -1 }, { price_vnd: 1.5 }, { price_vnd: '1000' }, { price_vnd: 1000, currency: 'USD' }]) {
    assert.equal(AdminProductPriceUpdateSchema.safeParse(bad).success, false, JSON.stringify(bad));
  }
  // product_prices has no currency/availability columns, so PATCH must not accept them either
  for (const field of ['currency', 'availability', 'purchasable']) {
    assert.equal(AdminProductUpdateSchema.safeParse({ [field]: 'x' }).success, false, field);
  }
  assert.equal(AdminProductUpdateSchema.safeParse({ price_vnd: 5000 }).success, true);
});

function adminServiceWith({ priceRow = null, upsertError = null } = {}) {
  const calls = [];
  const detail = { product: { product_id: 'CSI_CS655', model: 'CS655' } };
  const query = {
    select() { return this; },
    eq() { return this; },
    maybeSingle: async () => ({ data: priceRow, error: null }),
    upsert: async (row, options) => { calls.push({ row, options }); return { error: upsertError }; },
  };
  const supabase = { getClient: () => ({ from: (table) => { calls.push({ table }); return query; } }) };
  const products = {
    getAdmin: async () => detail,
    updateAdmin: async (_id, updates) => { calls.push({ updateAdmin: updates }); return detail; },
  };
  return { service: new AdminService(supabase, products), calls };
}

test('admin product detail exposes the stored price_vnd', async () => {
  const { service } = adminServiceWith({ priceRow: { price_vnd: '13210000' } });
  const detail = await service.getAdminProductDetail('CS655');
  assert.equal(detail.price_vnd, 13_210_000);
  const { service: noPrice } = adminServiceWith();
  assert.equal((await noPrice.getAdminProductDetail('CS655')).price_vnd, null);
});

test('setting a price upserts product_prices by product_id and surfaces write errors', async () => {
  const { service, calls } = adminServiceWith({ priceRow: { price_vnd: 9_000_000 } });
  await service.setProductPrice('CS655', 9_000_000);
  const upsert = calls.find((call) => call.row);
  assert.deepEqual(upsert.row, { product_id: 'CSI_CS655', price_vnd: 9_000_000 });
  assert.deepEqual(upsert.options, { onConflict: 'product_id' });

  const { service: failing } = adminServiceWith({ upsertError: { message: 'boom' } });
  await assert.rejects(failing.setProductPrice('CS655', 1), /giá sản phẩm/);
});

test('PATCH with price_vnd writes only the price table', async () => {
  const { service, calls } = adminServiceWith({ priceRow: { price_vnd: 7_000_000 } });
  const detail = await service.updateAdminProduct('CS655', { price_vnd: 7_000_000 });
  assert.equal(calls.some(call => call.updateAdmin), false);
  assert.deepEqual(calls.find((call) => call.row).row, { product_id: 'CSI_CS655', price_vnd: 7_000_000 });
  assert.equal(detail.price_vnd, 7_000_000);
});

test('search rate limit answers 429 after the per-minute budget', () => {
  const limit = createRateLimit({ limit: 2, windowMs: 60_000, message: 'slow down' });
  const run = (ip) => {
    const response = {
      headers: {},
      statusCode: 200,
      body: null,
      setHeader(name, value) { this.headers[name] = value; },
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
    };
    let passed = false;
    limit({ ip, method: 'POST', socket: {} }, response, () => { passed = true; });
    return { passed, response };
  };
  assert.equal(run('10.0.0.1').passed, true);
  assert.equal(run('10.0.0.1').passed, true);
  const blocked = run('10.0.0.1');
  assert.equal(blocked.passed, false);
  assert.equal(blocked.response.statusCode, 429);
  assert.ok(Number(blocked.response.headers['Retry-After']) > 0);
  assert.equal(run('10.0.0.2').passed, true, 'other clients keep their own budget');
  const off = createRateLimit({ limit: 0, windowMs: 60_000, message: '' });
  let passed = 0;
  for (let i = 0; i < 5; i++) off({ ip: 'x', method: 'POST', socket: {} }, {}, () => passed++);
  assert.equal(passed, 5, 'limit 0 disables the middleware');
});

function vnpayWith(order, calls) {
  const repository = {
    findOrderByTxnRef: async () => order,
    recordPaymentSuccess: async () => { calls.push('success'); return { ...order, status: 'PROCESSING' }; },
    recordPaymentFailure: async () => { calls.push('failure'); return { ...order, status: 'PAYMENT_FAILED' }; },
  };
  const service = new VNPayService(repository);
  service.verifySignature = () => true;
  return service;
}

const paidCallback = (order) => ({
  vnp_TxnRef: 'T1', vnp_Amount: String(order.total * 100), vnp_ResponseCode: '00', vnp_TransactionStatus: '00', vnp_TransactionNo: '123',
});

test('a VNPay success never revives a cancelled order (browser return and IPN)', async () => {
  const order = { id: 'o1', order_code: 'REECO-1001', status: 'CANCELLED', payment_status: 'PENDING_PAYMENT', total: 1000 };
  const calls = [];
  const service = vnpayWith(order, calls);
  const result = await service.verifyPayment(paidCallback(order));
  assert.equal(result.success, false);
  assert.equal(result.code, 'ORDER_NOT_AWAITING_PAYMENT');
  const ipn = await service.processIpn(paidCallback(order));
  assert.equal(ipn.RspCode, '02');
  assert.deepEqual(calls, [], 'no payment write for a cancelled order');
});

test('a VNPay success still confirms an order that is waiting for payment', async () => {
  const order = { id: 'o2', order_code: 'REECO-1002', status: 'PENDING_PAYMENT', payment_status: 'PENDING_PAYMENT', total: 1000 };
  const calls = [];
  const result = await vnpayWith(order, calls).verifyPayment(paidCallback(order));
  assert.equal(result.success, true);
  assert.deepEqual(calls, ['success']);
});

test('a concurrent status change is reported instead of overwritten', async () => {
  const order = { id: 'o3', order_code: 'REECO-1003', status: 'PENDING_PAYMENT', payment_status: 'PENDING_PAYMENT', total: 1000 };
  const repository = {
    findOrderByTxnRef: async () => order,
    recordPaymentSuccess: async () => null, // conditional UPDATE matched no row
    recordPaymentFailure: async () => null,
  };
  const service = new VNPayService(repository);
  service.verifySignature = () => true;
  const result = await service.verifyPayment(paidCallback(order));
  assert.equal(result.code, 'ORDER_NOT_AWAITING_PAYMENT');
  assert.equal((await service.processIpn(paidCallback(order))).RspCode, '02');
});

const checkoutPayload = {
  items: [{ product_id: 'CSI_CS655', quantity: 2 }],
  shipping_method: 'standard',
  payment_method: 'cod',
  customer_name: 'Hai Tran',
  customer_email: 'haitran@example.com',
  customer_phone: '+84 908 123 456',
  shipping_address: '128 Nguyen Van Thu',
  city: 'Ho Chi Minh City',
  province: 'Ho Chi Minh',
  country: 'Vietnam',
};

test('order bodies are validated at runtime', () => {
  assert.equal(CreateOrderSchema.safeParse(checkoutPayload).success, true);
  const stripped = CreateOrderSchema.parse({ ...checkoutPayload, total: 1, customer_id: 'someone-else' });
  assert.equal('total' in stripped || 'customer_id' in stripped, false, 'client cannot set totals or owner');
  for (const bad of [
    { payment_method: 'bank_transfer' },
    { customer_email: 'not-an-email' },
    { customer_phone: 'call me' },
    { items: [] },
    { items: [{ product_id: 'CSI_CS655', quantity: 0 }] },
  ]) {
    assert.equal(CreateOrderSchema.safeParse({ ...checkoutPayload, ...bad }).success, false, JSON.stringify(bad));
  }
  assert.equal(UpdateOrderStatusSchema.safeParse({ status: 'FORWARDED_TO_MANUFACTURER' }).success, true);
  assert.equal(UpdateOrderStatusSchema.safeParse({ status: 'DELIVERING' }).success, false);
});

test('admin order search cannot inject PostgREST filter conditions', async () => {
  const filters = [];
  const query = {
    eq(column, value) { filters.push(['eq', column, value]); return query; },
    or(expression) { filters.push(['or', expression]); return query; },
    order() { return query; },
    range: async () => ({ data: [], count: 0, error: null }),
  };
  const client = { from: () => ({ select: () => query }) };
  const repository = new OrdersRepository({ getClient: () => client });
  await repository.listAdminOrders({ search: 'x\\",status.eq.DELIVERED', status: 'NOT_A_STATUS' });
  assert.equal(filters.some(([kind]) => kind === 'eq'), false, 'unknown status is ignored');
  const or = filters.find(([kind]) => kind === 'or')[1];
  assert.equal(or.includes('\\'), false);
  assert.equal(or.includes('\\"'), false);
  for (const part of or.split(/,(?=[a-z_]+\.(?:eq|ilike)\.)/)) {
    assert.match(part, /^[a-z_]+\.(?:eq|ilike)\./, `unexpected filter segment: ${part}`);
  }
});
