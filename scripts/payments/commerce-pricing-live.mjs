import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../../apps/api/dist/app.module.js');
const { ProductsService } = require('../../apps/api/dist/modules/products/products.service.js');
const { AdminService } = require('../../apps/api/dist/modules/admin/admin.service.js');
const { SearchService } = require('../../apps/api/dist/modules/search/search.service.js');
const { SupabaseService } = require('../../apps/api/dist/database/supabase/supabase.service.js');
const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
try {
  const client = app.get(SupabaseService).getClient();
  const { data, error } = await client.from('product_prices').select('product_id,price_vnd');
  assert.ifError(error);
  const prices = new Map(data.map(p => [p.product_id, Number(p.price_vnd)]));
  const products = app.get(ProductsService);
  const list = await products.listPublic({ page: 1, limit: 100 });
  for (const p of list.items) assert.equal(p.price_vnd, prices.get(p.product_id) ?? null, p.model);
  const detail = await products.getPublic('CSI_CS655');
  assert.equal(detail.product.price_vnd, prices.get('CSI_CS655'));
  const search = await app.get(SearchService).search({ query: 'CS655', limit: 1, explain: false });
  assert.equal(search.results[0].price_vnd, prices.get('CSI_CS655'));
  const admin = await app.get(AdminService).getAdminProductDetail('CSI_CS655');
  assert.equal(admin.price_vnd, prices.get('CSI_CS655')); assert.ok(Array.isArray(admin.price_history));
  const summary = { generated_at: new Date().toISOString(), mode: 'read-only', products_checked: list.items.length,
    list_detail_search_admin_price: 'PASS', history_api: 'PASS', new_orders_created: 0, prices_modified: 0 };
  await writeFile('output/commerce-fixes/live-pricing.json', JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary));
} finally { await app.close(); }
