import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { createClient } from '@supabase/supabase-js';

// Only reviewed attributes; compare before writing so another editor's data survives.
const reviewed = [['CSI_109', 'sensor_description'], ['CSI_CLIMAVUE40', 'communications'], ['CSI_TX325', 'satellite_system']];
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const value = s => ({ ...(s.normalized ?? { type: 'text', value: s.value_raw }), value_raw: s.value_raw });
const plan = [];
for (const [id, key] of reviewed) {
  const path = `data/normalized/specifications/${id}.json`;
  const current = JSON.parse(await readFile(path, 'utf8')).specifications.find(s => s.canonical_key === key);
  const previous = JSON.parse(execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' })).specifications.find(s => s.canonical_key === key);
  const { data, error } = await client.from('product_specifications').select('*').eq('product_id', id).eq('canonical_key', key);
  assert.ifError(error); assert.equal(data.length, 1);
  assert.ok(isDeepStrictEqual(data[0].normalized_value, value(previous)) || isDeepStrictEqual(data[0].normalized_value, value(current)), `${id}: independent hosted change`);
  plan.push({ row: data[0], next: value(current) });
}
await mkdir('output/bug-log', { recursive: true });
if (process.argv.includes('--execute')) {
  await writeFile('output/bug-log/spec-sync-backup.json', JSON.stringify(plan, null, 2), { flag: 'wx' });
  for (const { row, next } of plan) {
    const { data, error } = await client.from('product_specifications').update({ normalized_value: next })
      .eq('specification_id', row.specification_id).eq('normalized_value', JSON.stringify(row.normalized_value)).select('specification_id');
    assert.ifError(error); assert.equal(data.length, 1, 'Concurrent change: stopped');
  }
}
console.log(JSON.stringify({ mode: process.argv.includes('--execute') ? 'execute' : 'dry-run', reviewed: reviewed.map(([id, field]) => ({ id, field })) }));
