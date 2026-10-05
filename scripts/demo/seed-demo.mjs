// Seeds demo data for the commerce flow. Safe to run repeatedly.
//   - 2 demo accounts (customer + admin), role stored in app_metadata
//   - product_prices for every product in public.products
//
// Usage: npm run demo:seed            (reads apps/api/.env)
//        npm run demo:seed -- --dry-run
// Requires migration 20261001000000_commerce_foundation.sql to be applied.

import { createClient } from '@supabase/supabase-js';

const DEMO_PASSWORD = 'ilovereeco';

const DEMO_USERS = [
  {
    email: 'haitran@example.com',
    role: 'customer',
    full_name: 'Hai Tran',
    phone: '+84 908 123 456',
    company: 'Vietnam Meteorological Station',
  },
  {
    email: 'admin@reeco.vn',
    role: 'admin',
    full_name: 'REECO Administrator',
    phone: null,
    company: 'REECO Science & Technology',
  },
];

// Same list and fallback formula as apps/client/src/services/commercialService.js,
// so prices shown before and after moving pricing to the server stay identical.
const PRICE_MAP = {
  CSI_CS655: 13_210_000,
  CSI_CS650: 12_190_000,
  CSI_CS616: 10_030_000,
  CSI_CS610: 7_870_000,
  CSI_109: 4_700_000,
  CSI_43347: 8_640_000,
  CSI_TEMPVUE20_S: 11_430_000,
  CSI_TEMPVUE50: 12_450_000,
  CSI_EE181: 14_730_000,
  CSI_HYGROVUE10: 9_910_000,
  CSI_SOILVUE10_5: 22_610_000,
  CSI_SOILVUE10_1: 29_210_000,
  CSI_HS2_12: 31_750_000,
  CSI_CS506: 10_670_000,
  CSI_METSENS500_DS: 41_910_000,
  CSI_METSENS200_D2: 24_890_000,
  CSI_METSENS300_D2: 29_210_000,
  CSI_METSENS550_D2: 46_990_000,
  CSI_CR300: 17_270_000,
  CSI_CR310_NA: 21_590_000,
  CSI_CR310_WIFI: 23_370_000,
  CSI_CR350_NA: 32_510_000,
  CSI_CR6_NA_ST_CC: 67_310_000,
  CSI_CR1000X: 54_610_000,
  CSI_PS84_CR: 18_290_000,
  CSI_PS24_W_CH150: 14_990_000,
  CSI_PS200: 11_430_000,
  CSI_PS150: 9_650_000,
};

function calculateFallbackPrice(identifier) {
  if (!identifier) return 11_430_000;
  let hash = 0;
  const str = String(identifier);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash) % 1500;
  return 6_250_000 + Math.floor(base / 10) * 250_000;
}

export function priceFor(productId, model) {
  return PRICE_MAP[productId] ?? PRICE_MAP[model] ?? calculateFallbackPrice(productId || model);
}

const dryRun = process.argv.includes('--dry-run');

function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function findUserByEmail(supabase, email) {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found || data.users.length < 200) return found ?? null;
  }
}

async function seedUsers(supabase) {
  for (const { email, role, ...profile } of DEMO_USERS) {
    const existing = await findUserByEmail(supabase, email);
    const attributes = {
      password: DEMO_PASSWORD,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: profile,
    };
    if (dryRun) {
      console.log(`[dry-run] ${existing ? 'update' : 'create'} ${role} ${email}`);
      continue;
    }
    const { error } = existing
      ? await supabase.auth.admin.updateUserById(existing.id, {
          ...attributes,
          app_metadata: { ...existing.app_metadata, role },
        })
      : await supabase.auth.admin.createUser({ email, ...attributes });
    if (error) throw new Error(`${email}: ${error.message}`);
    console.log(`${existing ? 'updated' : 'created'} ${role} ${email}`);
  }
}

async function seedPrices(supabase) {
  const { data: products, error } = await supabase
    .from('products')
    .select('product_id, model')
    .range(0, 9999);
  if (error) throw error;

  const rows = products.map((p) => ({ product_id: p.product_id, price_vnd: priceFor(p.product_id, p.model) }));
  const mapped = rows.filter((r) => PRICE_MAP[r.product_id] !== undefined).length;
  if (dryRun) {
    console.log(`[dry-run] upsert ${rows.length} prices (${mapped} from price list, ${rows.length - mapped} fallback)`);
    return;
  }
  for (let i = 0; i < rows.length; i += 500) {
    const { error: upsertError } = await supabase
      .from('product_prices')
      .upsert(rows.slice(i, i + 500), { onConflict: 'product_id' });
    if (upsertError) {
      throw new Error(
        `product_prices upsert failed: ${upsertError.message}. Is the commerce_foundation migration applied?`,
      );
    }
  }
  console.log(`upserted ${rows.length} prices (${mapped} from price list, ${rows.length - mapped} fallback)`);
}

async function main() {
  const supabase = createAdminClient();
  await seedUsers(supabase);
  await seedPrices(supabase);
  console.log(`done. demo password for all accounts: ${DEMO_PASSWORD}`);
}

import { fileURLToPath } from 'url';
import { resolve } from 'path';

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message ?? error);
    process.exit(1);
  });
}
