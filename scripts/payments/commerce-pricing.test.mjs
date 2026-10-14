import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { PGlite } from '@electric-sql/pglite';
const require = createRequire(import.meta.url);
const { ProductsService } = require('../../apps/api/dist/modules/products/products.service.js');
const { OrdersService } = require('../../apps/api/dist/modules/orders/orders.service.js');
const { AdminService } = require('../../apps/api/dist/modules/admin/admin.service.js');

test('list, detail and search summaries expose the same current server price, including zero', async () => {
  let price = 100;
  const product = () => ({ product_id: 'p', model: 'P', product_name_en: 'Product', status: 'active', category: null, subcategory: null, device_type: null, product_prices: { price_vnd: price } });
  const service = new ProductsService({ list: async () => [product()], listByIds: async () => [product()], findByIdOrModel: async () => product(),
    listDocuments: async () => [], listMedia: async () => [], listSpecifications: async () => [] });
  for (price of [100, 250, 0]) {
    assert.equal((await service.listPublic({ page: 1, limit: 100 })).items[0].price_vnd, price);
    assert.equal((await service.getPublic('p')).product.price_vnd, price);
    assert.equal((await service.getPublicSummariesByIds(['p'])).get('p').price_vnd, price);
  }
});

test('stale checkout quote cannot create an order, and client price is never used for billing', async () => {
  let writes = 0;
  const service = new OrdersService({ getProductsAndPrices: async () => new Map([['p', { model: 'P', status: 'active', price_vnd: 250 }]]),
    createOrder: async params => { writes++; return params; } });
  const dto = { items: [{ product_id: 'p', quantity: 2, expected_unit_price: 100 }], payment_method: 'cod', customer_name: 'A', customer_phone: '0912345678', shipping_address: 'Street', city: 'City', customer_email: 'a@example.com' };
  await assert.rejects(service.createOrder({ id: 'customer' }, dto), error => error.getStatus() === 409);
  assert.equal(writes, 0);
  dto.items[0].expected_unit_price = 250;
  const result = await service.createOrder({ id: 'customer' }, dto);
  assert.equal(result.subtotal, 500); assert.equal(result.items[0].unit_price, 250);
  assert.equal(writes, 1);
});

test('price history is atomic, records real changes/actor, denies customers and rolls back failed auditing', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create role service_role;
      create schema auth; create table auth.users(id uuid primary key);
      insert into auth.users values ('00000000-0000-0000-0000-000000000001');
      create table products(product_id text primary key); insert into products values ('p');
      create table product_prices(product_id text primary key references products, price_vnd bigint check(price_vnd>=0), updated_at timestamptz default now());
      insert into product_prices values('p',100,now());`);
    await db.exec(await readFile('supabase/migrations/20261014000000_product_price_history.sql', 'utf8'));
    const args = ['p',200,'00000000-0000-0000-0000-000000000001','admin@example.com'];
    await db.query('select set_product_price($1,$2,$3,$4)', args);
    await db.query('select set_product_price($1,$2,$3,$4)', args);
    let history = (await db.query('select * from product_price_history')).rows;
    assert.equal(history.length, 1); assert.equal(Number(history[0].old_price_vnd), 100);
    assert.equal(Number(history[0].new_price_vnd), 200); assert.equal(history[0].changed_by_email, args[3]);
    await assert.rejects(db.query('select set_product_price($1,$2,$3,$4)', ['p',300,'00000000-0000-0000-0000-000000000099','forged@example.com']), /foreign key/iu);
    assert.equal(Number((await db.query('select price_vnd from product_prices')).rows[0].price_vnd), 200);
    assert.equal((await db.query('select * from product_price_history')).rows.length, 1);
    await db.exec('set role authenticated');
    await assert.rejects(db.query('select set_product_price($1,$2,$3,$4)', args), /permission denied/iu);
    await assert.rejects(db.query('select * from product_price_history'), /permission denied/iu);
    await db.exec('reset role');
  } finally { await db.close(); }
});

test('the authenticated admin identity reaches the price-and-audit write', async () => {
  let args;
  const query = { select() { return this; }, eq() { return this; }, order() { return this; },
    maybeSingle: async () => ({ data: { price_vnd: 200 } }), limit: async () => ({ data: [] }) };
  const service = new AdminService({ getClient: () => ({ from: () => query, rpc: async (_name, input) => { args = input; return {}; } }) },
    { getAdmin: async () => ({ product: { product_id: 'p' } }) });
  await service.setProductPrice('p',200,{ id: 'admin-id', email: 'admin@example.com' });
  assert.equal(args.p_actor_id, 'admin-id'); assert.equal(args.p_actor_email, 'admin@example.com');
});
