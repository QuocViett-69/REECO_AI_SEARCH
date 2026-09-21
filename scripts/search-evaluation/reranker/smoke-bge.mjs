import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { BGE_CONFIG, BgeRerankerProvider } from './bge-provider.mjs';
import { compactCandidate } from './candidate-input.mjs';

const root = path.resolve(import.meta.dirname, '..', '..', '..');
const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));
const [relevantDocument, unrelatedDocument] = await Promise.all([
  readJson('data', 'search-documents', 'CSI_CS655.json'),
  readJson('data', 'search-documents', 'CSI_CELL205_AT.json'),
]);
const candidates = [relevantDocument, unrelatedDocument].map((document) => compactCandidate(document));
const provider = new BgeRerankerProvider();
const ready = await provider.start();
const smoke = [];
try {
  for (const [language, query] of [['en', 'soil moisture sensor'], ['vi', 'cảm biến độ ẩm đất']]) {
    const result = await provider.rerank({ query, candidates });
    console.log(JSON.stringify({ language, query, order: result.ordered_candidate_ids, scores: result.scores }, null, 2));
    assert.equal(result.ordered_candidate_ids[0], relevantDocument.product_id);
    assert.ok(result.scores[relevantDocument.product_id] > result.scores[unrelatedDocument.product_id]);
    smoke.push({ language, query, relevant_product_id: relevantDocument.product_id, unrelated_product_id: unrelatedDocument.product_id, relevant_score: result.scores[relevantDocument.product_id], unrelated_score: result.scores[unrelatedDocument.product_id], inference_ms: result.timing_metadata.inference_ms });
  }
} finally {
  await provider.close();
}
const report = {
  schema_version: '1.0', report_id: 'reranker-bge-smoke-v1', generated_at: new Date().toISOString(),
  result: 'PASS', model: BGE_CONFIG.modelId, revision: BGE_CONFIG.revision,
  cache_location: BGE_CONFIG.modelPath, download_seconds: 357.273, runtime: ready, cases: smoke,
};
await writeFile(path.join(root, 'data', 'reports', 'reranker-bge-smoke-v1.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
