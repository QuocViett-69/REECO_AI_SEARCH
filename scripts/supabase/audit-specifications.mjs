import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
process.loadEnvFile(path.join(root, 'apps/api/.env'));
const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const canonical = (value) => JSON.stringify(value, (_, item) =>
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b))) : item);
const identity = (row) => `${row.product_id}:${row.raw_ref.file}:${row.raw_ref.product_index}:${row.raw_ref.spec_index}`;

async function rows(table, select, order) {
  const all = [];
  for (let offset = 0; ; offset += 1000) {
    const url = new URL(`/rest/v1/${table}`, process.env.SUPABASE_URL);
    url.search = new URLSearchParams({ select, order, limit: '1000', offset: String(offset) });
    const response = await fetch(url, { headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${table} audit failed (${response.status})`);
    const page = await response.json();
    assert.ok(Array.isArray(page));
    all.push(...page);
    if (page.length < 1000) return all;
  }
}

const [products, live] = await Promise.all([
  rows('products', 'product_id,model,status', 'product_id'),
  rows('product_specifications', 'product_id,specification_id,canonical_key,quantity_kind,normalized_value,raw_ref', 'specification_id'),
]);
const master = await readJson('data/master/product-master.json');
const active = new Set(master.filter((p) => p.status === 'active').map((p) => p.product_id));
const files = (await readdir(path.join(root, 'data/normalized/specifications'))).filter((f) => f.endsWith('.json'));
const local = (await Promise.all(files.map((f) => readJson(`data/normalized/specifications/${f}`))))
  .flatMap((d) => d.specifications).filter((s) => active.has(s.product_id));
const expected = new Map(local.map((s) => [identity(s), s]));
const errors = [];
const rawFiles = new Map();
for (const spec of local) {
  if (!rawFiles.has(spec.raw_ref.file)) rawFiles.set(spec.raw_ref.file, await readJson(spec.raw_ref.file));
  const raw = rawFiles.get(spec.raw_ref.file).products[spec.raw_ref.product_index]?.specifications[spec.raw_ref.spec_index];
  if (!raw || raw.value_raw !== spec.value_raw || raw.name_en !== spec.name_raw) {
    errors.push({ kind: 'raw_normalized_mismatch', key: identity(spec) });
  }
}
const seen = new Set();
const grouped = new Map();
const suspectCharacters = [];
for (const row of live) {
  const key = identity(row);
  if (seen.has(key)) errors.push({ kind: 'duplicate_source_row', key });
  seen.add(key);
  const source = expected.get(key);
  if (!source) errors.push({ kind: 'unexpected_database_row', key });
  else {
    const value = { ...(source.normalized ?? { type: 'text', value: String(source.value_raw) }), value_raw: String(source.value_raw) };
    if (row.canonical_key !== source.canonical_key || row.quantity_kind !== (source.quantity_kind ?? null)
      || canonical(row.normalized_value) !== canonical(value) || canonical(row.raw_ref) !== canonical(source.raw_ref)) {
      errors.push({ kind: 'database_source_mismatch', key });
    }
  }
  const text = row.normalized_value.value_raw ?? '';
  if (/\uFFFD|\u00c2[\u00b0\u00b1\u00b5]|\u00e2[\u0080\u0089]|&(?:deg|plusmn|le|ge|nbsp);/u.test(text)) {
    suspectCharacters.push({ product_id: row.product_id, key: row.canonical_key, value: text });
  }
  const groupKey = `${row.product_id}:${row.canonical_key}`;
  if (!grouped.has(groupKey)) grouped.set(groupKey, []);
  grouped.get(groupKey).push(row);
}
for (const key of expected.keys()) if (!seen.has(key)) errors.push({ kind: 'missing_database_row', key });
const liveActive = new Set(products.filter((p) => p.status === 'active').map((p) => p.product_id));
for (const id of active) if (!liveActive.has(id)) errors.push({ kind: 'missing_active_product', product_id: id });
for (const id of liveActive) if (!active.has(id)) errors.push({ kind: 'unexpected_active_product', product_id: id });
const repeated = [...grouped.values()].filter((group) => group.length > 1).map((group) => ({
  product_id: group[0].product_id,
  canonical_key: group[0].canonical_key,
  values: group.map((row) => row.normalized_value.value_raw),
}));
const report = {
  checked_at: new Date().toISOString(),
  scope: 'All live product specifications versus normalized artifacts and referenced raw rows; not a vendor review of every numeric fact.',
  summary: { products: products.length, active_products: liveActive.size, specifications: live.length,
    source_mismatches: errors.length, suspect_characters: suspectCharacters.length,
    repeated_key_products: new Set(repeated.map((g) => g.product_id)).size, repeated_key_groups: repeated.length },
  errors, suspect_characters: suspectCharacters, repeated_key_groups: repeated,
};
await writeFile(path.join(root, 'data/reports/supabase-specification-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary, null, 2));
assert.equal(errors.length, 0, 'Database/source mismatches; see data/reports/supabase-specification-audit.json');
assert.equal(suspectCharacters.length, 0, 'Suspect character encoding; see audit report');
