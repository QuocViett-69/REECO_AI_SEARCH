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
const { AdminController, AdminOperationsController } = dist('modules/admin/admin.controller.js');
const { AdminPaymentsQuerySchema } = dist('modules/admin/admin-payments-query.schema.js');
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
  for (const controller of [AdminController, AdminOperationsController, ImportsController, AdminOrdersController]) {
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
    order() { return this; },
    limit: async () => ({ data: [], error: null }),
    maybeSingle: async () => ({ data: priceRow, error: null }),
    upsert: async (row, options) => { calls.push({ row, options }); return { error: upsertError }; },
  };
  const supabase = { getClient: () => ({ from: (table) => { calls.push({ table }); return query; },
    rpc: async (name, args) => { calls.push({ name, args }); return { error: upsertError }; } }) };
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

test('setting a price uses the atomic audit RPC and surfaces write errors', async () => {
  const { service, calls } = adminServiceWith({ priceRow: { price_vnd: 9_000_000 } });
  await service.setProductPrice('CS655', 9_000_000);
  const write = calls.find(call => call.name);
  assert.equal(write.name, 'set_product_price');
  assert.deepEqual(write.args, { p_product_id: 'CSI_CS655', p_price_vnd: 9_000_000, p_actor_id: null, p_actor_email: null });

  const { service: failing } = adminServiceWith({ upsertError: { message: 'boom' } });
  await assert.rejects(failing.setProductPrice('CS655', 1), /giá sản phẩm/);
});

test('PATCH with price_vnd writes only the price table', async () => {
  const { service, calls } = adminServiceWith({ priceRow: { price_vnd: 7_000_000 } });
  const detail = await service.updateAdminProduct('CS655', { price_vnd: 7_000_000 });
  assert.equal(calls.some(call => call.updateAdmin), false);
  assert.equal(calls.find(call => call.name).args.p_price_vnd, 7_000_000);
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

// ─── Admin operations: data quality, clients, payments ──────────────────────

// In-memory PostgREST stand-in: range() serves slices of `tables`, every other builder call is
// recorded and chainable, and awaiting a builder directly resolves to a head-count response.
function fakeSupabase(tables) {
  const calls = [];
  const builder = (table) => {
    const q = {
      table,
      select() { return q; },
      order() { return q; },
      not() { return q; },
      eq(column, value) { calls.push({ table, eq: [column, value] }); return q; },
      match(filters) { calls.push({ table, match: filters }); return q; },
      in(column, values) { calls.push({ table, in: [column, values] }); return q; },
      or(expression) { calls.push({ table, or: expression }); return q; },
      range: async (from, to) => {
        calls.push({ table, range: [from, to] });
        return { data: (tables[table] ?? []).slice(from, to + 1), error: null };
      },
      then: (resolve, reject) => Promise.resolve({ data: null, count: 0, error: null }).then(resolve, reject),
    };
    return q;
  };
  return { calls, supabase: { getClient: () => ({ from: builder }) } };
}

const EMBEDDING = { embedding_model: 'qwen3-embedding:4b', embedding_dimensions: 1536, embedding_version: 'ollama-qwen3-embedding-4b-1536-v1' };

function catalog(size) {
  const ids = Array.from({ length: size }, (_, i) => `P${String(i).padStart(4, '0')}`);
  return {
    products: ids.map((id) => ({ product_id: id, model: id, product_name_en: `Sensor ${id}`, category: 'Sensors', status: 'active', product_specifications: [{ count: 3 }] })),
    product_prices: ids.map((id) => ({ product_id: id, price_vnd: 1000 })),
    product_documents: ids.map((id) => ({ product_id: id, content_hash: `h-${id}`, name_vi: `Cảm biến ${id}`, source_versions: { semantic_enrichment: '1.0' }, applications: [{ key: 'x' }], capabilities: [] })),
    product_media: ids.map((id) => ({ product_id: id })),
    product_search_index: ids.map((id) => ({ product_id: id, source_content_hash: `h-${id}`, ...EMBEDDING })),
  };
}

test('data quality reads every page past PostgREST max_rows (1000)', async () => {
  const { supabase, calls } = fakeSupabase(catalog(1001));
  const { stats, products } = await new AdminService(supabase, {}).getQuality();
  assert.equal(products.length, 1001);
  assert.equal(stats.totalProducts, 1001);
  // Product 1001's image, price, name and index row are all on the second page
  assert.equal(stats.missingImage, 0);
  assert.equal(stats.missingPrice, 0);
  assert.equal(stats.missingViName, 0);
  assert.equal(stats.needsReview, 0);
  assert.equal(stats.searchIndexHealth.status, 'healthy');
  assert.ok(calls.some((c) => c.table === 'product_media' && c.range[0] === 1000), 'second media page requested');
});

test('data quality: needs_review drives the KPI, EN name alone is not a review reason', async () => {
  const tables = catalog(3);
  tables.products[0].product_name_en = '';
  tables.product_documents[1].name_vi = null;
  tables.products[2].category = null;
  tables.product_media = [];
  const { products, stats } = await new AdminService(fakeSupabase(tables).supabase, {}).getQuality();
  const byId = Object.fromEntries(products.map((p) => [p.product_id, p]));
  assert.deepEqual(byId.P0000.missing_fields, ['Missing EN Name', 'Missing Image']);
  assert.equal(byId.P0001.missing_fields.includes('Missing VI Name'), true);
  assert.equal(byId.P0002.category, null, 'a missing category is reported, not replaced');
  assert.equal(stats.missingImage, 3);
  assert.equal(stats.needsReview, products.filter((p) => p.needs_review).length);

  const noImage = catalog(1);
  noImage.products[0].product_name_en = '';
  const only = (await new AdminService(fakeSupabase(noImage).supabase, {}).getQuality()).products[0];
  assert.equal(only.needs_review, false);
});

test('search index health reports stale documents, stale embeddings and missing enrichment', async () => {
  const tables = catalog(4);
  tables.product_search_index[0].source_content_hash = 'h-old';
  tables.product_search_index[1] = { ...tables.product_search_index[1], embedding_version: 'old-version' };
  tables.product_documents[2] = { ...tables.product_documents[2], applications: [], capabilities: [] };
  tables.products[3].status = 'review';
  tables.product_search_index[3] = { product_id: 'P0003', source_content_hash: 'h-P0003', embedding_model: null, embedding_dimensions: null, embedding_version: null };
  const { stats } = await new AdminService(fakeSupabase(tables).supabase, {}).getQuality();
  assert.deepEqual(stats.searchIndexHealth, {
    staleSearchDocument: 1,
    staleEmbedding: 1, // the review product is never embedded, so it does not count
    missingSemanticEnrichment: 1,
    status: 'degraded',
  });
});

test('clients merge emails case-insensitively, page past 1000 orders and keep the latest contact', async () => {
  const filler = Array.from({ length: 1000 }, (_, i) => ({ customer_id: `f${i}`, customer_email: `f${i}@x.vn`, customer_name: 'F', customer_phone: '1', total: 1, payment_status: 'PAID', status: 'DELIVERED', created_at: '2026-01-01T00:00:00Z' }));
  const orders = [
    ...filler,
    { customer_id: 'u1', customer_email: 'An@Mail.com', customer_name: 'An Old', customer_phone: '0900', total: 100, payment_status: 'PAID', status: 'DELIVERED', created_at: '2026-09-01T00:00:00Z' },
    { customer_id: 'u1', customer_email: ' an@mail.com ', customer_name: 'An New', customer_phone: '0911', total: 50, payment_status: 'COD_PENDING', status: 'PROCESSING', created_at: '2026-10-01T00:00:00Z' },
  ];
  const clients = await new AdminService(fakeSupabase({ orders }).supabase, {}).getClients();
  assert.equal(clients.length, 1001);
  const an = clients.find((c) => c.id === 'u1');
  assert.deepEqual(
    { name: an.name, phone: an.phone, orders: an.orders_count, spent: an.total_spent, active: an.active_orders_count },
    { name: 'An New', phone: '0911', orders: 2, spent: 100, active: 1 },
  );
});

test('payments query accepts only API enums and bounded paging', () => {
  assert.deepEqual(AdminPaymentsQuerySchema.parse({}), { page: 1, page_size: 20 });
  assert.deepEqual(AdminPaymentsQuerySchema.parse({ method: 'vnpay', status: 'COD_PENDING', page: '2', search: '  ' }), {
    method: 'vnpay', status: 'COD_PENDING', page: 2, page_size: 20, search: undefined,
  });
  for (const bad of [{ method: 'VNPAY' }, { method: 'ALL' }, { status: 'PENDING' }, { page: 0 }, { page_size: 500 }, { search: 'x'.repeat(101) }]) {
    assert.equal(AdminPaymentsQuerySchema.safeParse(bad).success, false, JSON.stringify(bad));
  }
});

test('payments: every count uses the table filters, and search cannot inject conditions', async () => {
  const { supabase, calls } = fakeSupabase({ orders: [] });
  const result = await new AdminService(supabase, {}).getPayments(
    AdminPaymentsQuerySchema.parse({ method: 'cod', search: 'x\\",payment_status.eq.PAID' }),
  );
  assert.deepEqual(result.items, []);
  // 1 list query + 5 KPI counts, each with the same method filter and search
  assert.equal(calls.filter((c) => c.match).length, 6);
  assert.ok(calls.filter((c) => c.match).every((c) => c.match.payment_method === 'cod'));
  const ors = calls.filter((c) => c.or).map((c) => c.or);
  assert.equal(ors.length, 6);
  for (const or of ors) {
    assert.equal(or.includes('\\'), false);
    for (const part of or.split(/,(?=[a-z_]+\.ilike\.)/)) {
      assert.match(part, /^[a-z_]+\.ilike\."%[^"]*%"$/, `unexpected filter segment: ${part}`);
    }
  }
  assert.deepEqual(calls.find((c) => c.range)?.range, [0, 19]);
});
