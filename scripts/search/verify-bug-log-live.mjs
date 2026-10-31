import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { expected, explanationChecks, originalIds, firstExpected } from './bug-log-expectations.mjs';

const path = process.argv[2] ?? 'output/bug-log/after-llm.json';
const snapshot = JSON.parse(await readFile(path, 'utf8'));
assert.equal(snapshot.report.length, 25, '25 ordinary inputs; TC-19/27 require fault injection');
const outcome = [];
for (const item of snapshot.report) {
  const number = Number(item.id.slice(3));
  const run = operation => { try { operation(); return 'PASS'; } catch (error) { return `FAIL: ${error.message}`; } };
  const retrieval = run(() => {
    if (number >= 25) { assert.equal(item.status, 400); return; }
    assert.ok(item.response, item.error);
    if (number >= 22) { assert.deepEqual(item.response.results, []); return; }
    for (const model of expected[item.id]) assert.ok(item.response.results.some(p => p.model === model), `missing ${model}`);
    if (firstExpected.includes(item.id)) assert.equal(item.response.results[0].model, expected[item.id][0], 'preferred model must rank first');
    if (item.id === 'TC-14') for (const part of ['weather', 'data logger', 'cellular', 'power']) {
      const component = item.response.guidance.components.find(c => c.query.includes(part));
      assert.ok(component?.models.length, `no candidates for ${part}`);
    }
    if (['TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-06', 'TC-07', 'TC-11', 'TC-12', 'TC-18'].includes(item.id)) {
      assert.deepEqual(item.response.results.map(p => p.model).sort(), [...expected[item.id]].sort());
    }
    if (['TC-15','TC-16','TC-17'].includes(item.id)) assert.ok(item.response.results.every(p => !/cellular/iu.test(p.device_type)));
    if (['TC-10','TC-21'].includes(item.id)) assert.ok(item.response.results.every(p => !/logger/iu.test(p.device_type)));
  });
  const explanation = number >= 22 ? 'N/A' : run(() => {
    for (const p of item.response.results) {
      assert.ok(p.explanation?.evidence.length, `${p.model}: missing evidence`);
      assert.ok(item.trace.some(t => t.candidates.some(c => c.productId === p.product_id)), `${p.model}: absent from actual retrieval`);
    }
    if (explanationChecks[item.id]) {
      const p = item.response.results.find(p => p.model === expected[item.id][0]);
      assert.match(p.explanation.text, explanationChecks[item.id]);
    }
    if (item.id === 'TC-14') assert.match(item.response.guidance.text, /chưa xác nhận tương thích/u);
    if (['TC-05', 'TC-09'].includes(item.id)) for (const p of item.response.results) {
      assert.doesNotMatch(p.explanation.text, /full-scale|coordinate system|customized|\bheated\b|Precipitation Amount|measurement uncertainty|\bintensity\b/iu);
    }
  });
  const acceptance = item.id === 'TC-14' && !item.response?.results.some(p => p.model === 'CR300')
    ? 'BLOCKED_CATALOG: CR300 is absent; component-role checks alone do not pass TC42'
    : retrieval === 'PASS' && ['PASS', 'N/A'].includes(explanation) ? 'PASS' : 'FAIL';
  outcome.push({ id: item.id, original_id: originalIds[item.id] ?? null, retrieval, explanation, acceptance });
  console.log(originalIds[item.id] ?? item.id, retrieval, explanation, acceptance);
}
await writeFile(process.argv[3] ?? 'output/bug-log/live-verification.json', JSON.stringify({ snapshot: path, generated_at: new Date().toISOString(), outcome }, null, 2));
assert.ok(outcome.every(x => x.retrieval === 'PASS' && ['PASS','N/A'].includes(x.explanation)), 'Live acceptance failures above');
