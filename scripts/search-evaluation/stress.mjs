import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { cases, judgmentsFor } from './stress-cases.mjs';
import { mean, recallAt, reciprocalRankAt, ndcgAt } from './metrics.mjs';

const require = createRequire(import.meta.url);
const moduleRoot = process.argv.includes('--baseline-code') ? '../../output/search-stress/baseline-dist' : '../../apps/api/dist';
const load = name => require(`${moduleRoot}/modules/search/${name}.js`);
const { SearchService } = load('search.service');
const { TechnicalQueryParserService } = load('technical-query-parser.service');
const { TechnicalMatchService } = load('technical-match.service');
const { TechnicalRankingService } = load('technical-ranking.service');
const { ExplanationService } = load('explanation.service');
const { RerankerService } = load('reranker.service');
const dir = new URL('../../output/search-stress/', import.meta.url);
await mkdir(dir, { recursive: true });
const phase = process.argv.find(a => a.startsWith('--phase='))?.slice(8) ?? 'before';
const replay = process.argv.includes('--replay');
const retrievalFile = process.argv.find(a => a.startsWith('--retrieval='))?.slice(12) ?? 'retrieval.json';
const refreshIds = process.argv.find(a => a.startsWith('--refresh-queries='))?.slice(18).split(',') ?? [];
const write = (file, data) => writeFile(new URL(file, dir), JSON.stringify(data, null, 2) + '\n');
process.env.LLM_EXPLANATION_ENABLED = 'false';
process.env.RERANKER_ENABLED = 'true';
const configuredTimeout = Number(process.env.RERANKER_TIMEOUT_MS ?? 350);
// Offline comparison allows the local model to finish; production timeout is reported separately.
process.env.RERANKER_TIMEOUT_MS = '60000';
let app;
let catalog;
let sources = {};
let hybrid;
if (replay && !process.argv.includes('--refresh-catalog') && !refreshIds.length) {
  catalog = JSON.parse(await readFile(new URL('catalog.json', dir), 'utf8'));
  sources = JSON.parse(await readFile(new URL(retrievalFile, dir), 'utf8'));
} else {
  const { NestFactory } = require('@nestjs/core');
  const { AppModule } = require('../../apps/api/dist/app.module.js');
  const { ProductsService } = require('../../apps/api/dist/modules/products/products.service.js');
  const { HybridSearchService } = require('../../apps/api/dist/modules/search/hybrid-search.service.js');
  app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  const live = app.get(ProductsService);
  const identities = await live.getActiveTechnicalIdentityCatalog();
  const ids = identities.map(i => i.productId);
  const [evidence, summaries] = await Promise.all([live.getTechnicalEvidenceByIds(ids), live.getPublicSummariesByIds(ids)]);
  catalog = [...evidence.values()].map(e => ({ ...e, summary: summaries.get(e.product.product_id) }));
  await write('catalog.json', catalog);
  hybrid = app.get(HybridSearchService);
  if (replay) sources = JSON.parse(await readFile(new URL(retrievalFile, dir), 'utf8'));
}
for (const c of cases.filter(c => refreshIds.includes(c.id))) delete sources[c.query];
const byId = new Map(catalog.map(e => [e.product.product_id, e]));
const identities = catalog.map(e => ({ productId: e.product.product_id, model: e.product.model }));
const products = {
  getActiveTechnicalIdentityCatalog: async () => identities,
  getSearchDocumentsByIds: async ids => new Map(ids.filter(id => byId.has(id)).map(id => [id, byId.get(id).document])),
  getTechnicalEvidenceByIds: async ids => new Map(ids.filter(id => byId.has(id)).map(id => [id, byId.get(id)])),
  getEnvironmentalSpecificationsByIds: async ids => new Map(ids.map(id => [id, byId.get(id)?.specifications ?? []])),
  getPublicSummariesByIds: async ids => new Map(ids.filter(id => byId.has(id)).map(id => [id, byId.get(id).summary])),
};
const parser = new TechnicalQueryParserService();
const matcher = new TechnicalMatchService(products);
const ranking = new TechnicalRankingService();
const explanation = new ExplanationService();
const reranker = new RerankerService(products);
let rerankTrace;
// Capture real service scores without changing public API score semantics.
const requestRerank = reranker.request.bind(reranker);
reranker.request = async (...args) => {
  const start = performance.now();
  try {
    const result = await requestRerank(...args);
    rerankTrace = { response: result, elapsed_ms: performance.now() - start };
    return result;
  } catch (error) {
    rerankTrace = { error: error.name, elapsed_ms: performance.now() - start };
    throw error;
  }
};
const allCases = [...cases, ...identities.map((i, n) => ({ id: `CAT${String(n + 1).padStart(3, '0')}`, query: i.model, intent: `model:${i.model}`, language: 'model' }))];
const records = [];
function metrics(ids, judgments) {
  if (!judgments.length) return null;
  const hit = k => Number(ids.slice(0, k).some(id => judgments.some(j => j.product_id === id)));
  return { hit1: hit(1), hit3: hit(3), hit5: hit(5), mrr: reciprocalRankAt(ids, judgments, 100), recall5: recallAt(ids, judgments, 5), ndcg5: ndcgAt(ids, judgments, 5) };
}
function rows(candidates, field) {
  return candidates.filter(c => c[field] !== null).sort((a, b) => a[field] - b[field]).map(c => ({ product_id: c.productId, model: c.model, score: field === 'keywordRank' ? c.keywordScore : c.semanticScore }));
}
const failures = record => {
  const result = [];
  if (record.source_error) result.push('HYBRID_FUSION_FAILURE');
  if (record.unknown_ids.length) result.push('FILTER_FAILURE');
  if (record.error) {
    if (record.intent !== 'negative' || record.error.status !== 400) result.push('FILTER_FAILURE');
  } else if (record.intent === 'negative') result.push('NEGATION_FAILURE');
  else if (record.intent === 'outofdomain' && record.public.some(r => !/cannot confirm|no more specific|does not confirm|chưa/iu.test(r.explanation?.text ?? ''))) result.push('OUT_OF_DOMAIN_FAILURE');
  else if (record.metrics.public?.hit1 === 0) {
    result.push(record.id.startsWith('CAT') || /^[AP]/u.test(record.id) ? 'EXACT_MATCH_FAILURE'
      : record.id.startsWith('J') ? 'TYPO_FAILURE' : record.id.startsWith('G') ? 'NUMERIC_QUERY_FAILURE'
      : record.id.startsWith('E') ? 'TOKEN_NORMALIZATION_FAILURE' : record.language === 'vi/mixed' ? 'MULTILINGUAL_FAILURE' : 'SEMANTIC_FAILURE');
    if (record.metrics.keyword?.hit1 || record.metrics.semantic?.hit1) result.push('FILTER_FAILURE');
  }
  return result;
};
try {
  for (const c of allCases) {
    if (!sources[c.query]) {
      if (!hybrid) throw new Error(`Missing recorded retrieval: ${c.id}`);
      const start = performance.now();
      try { sources[c.query] = { ...await hybrid.search(c.query), elapsed_ms: performance.now() - start }; }
      catch (error) { sources[c.query] = { mode: 'failed', candidates: [], error: error.code ?? error.name }; }
      await write(retrievalFile, sources);
    }
    const source = sources[c.query];
    const judgments = judgmentsFor(c.intent, catalog);
    const record = { ...c, judgments, source_diagnostics: source.diagnostics, source_error: source.error,
      keyword: rows(source.candidates, 'keywordRank'), semantic: rows(source.candidates, 'semanticRank'),
      hybrid: source.candidates.map(r => ({ product_id: r.productId, model: r.model, score: r.rrfScore })),
      public: [], reranker: [], metrics: {}, unknown_ids: [], evidence_missing: [] };
    const captured = { search: async () => structuredClone(source) };
    const noRerank = { rerank: async (_q, _p, baseline) => baseline };
    const service = new SearchService(captured, products, parser, matcher, ranking, noRerank, explanation);
    rerankTrace = null;
    try {
      const request = { query: c.query, limit: 20, explain: true };
      record.public = (await service.search(request)).results;
      service.reranker = reranker;
      record.reranker = (await service.search(request)).results;
    } catch (error) { record.error = { status: error.getStatus?.(), message: error.message }; }
    record.rerank_trace = rerankTrace;
    for (const stage of ['keyword', 'semantic', 'hybrid', 'public', 'reranker']) {
      record.metrics[stage] = metrics(record[stage].map(r => r.product_id), judgments);
      record.unknown_ids.push(...record[stage].filter(r => !byId.has(r.product_id)).map(r => `${stage}:${r.product_id}`));
    }
    record.evidence_missing = record.public.filter(r => !r.explanation?.evidence.length).map(r => r.product_id);
    record.failure_classification = failures(record);
    record.status = record.failure_classification.length ? 'FAIL' : !judgments.length && !['negative', 'outofdomain', 'ambiguous'].includes(c.intent) ? 'UNJUDGED' : c.intent === 'negative' ? 'LIMITATION' : 'PASS';
    records.push(record);
    if (records.length % 10 === 0) {
      await write(`${phase}.json`, { complete: false, records });
      console.log(`${phase} ${records.length}/${allCases.length}: failures=${records.filter(r => r.status === 'FAIL').length}`);
    }
  }
} finally { await app?.close(); }
const summaryFor = selected => Object.fromEntries(['keyword', 'semantic', 'hybrid', 'public', 'reranker'].map(stage => [stage,
  Object.fromEntries(['hit1', 'hit3', 'hit5', 'mrr', 'recall5', 'ndcg5'].map(name => [name, mean(selected.map(r => r.metrics[stage]?.[name]))]))]));
const report = {
  complete: true, generated_at: new Date().toISOString(), phase, replay, catalog_count: catalog.length,
  supplied_cases: cases.length, exact_catalog_cases: identities.length, configured_reranker_timeout_ms: configuredTimeout,
  comparison_reranker_timeout_ms: 60000, llm_rewrite: false,
  methodology: 'Live retrieval once per query; stage comparisons reuse identical candidates and a full live catalog snapshot. Public = hybrid + production filters without reranker; reranker adds pinned BGE Top-5. Binary evidence-derived judgments are provisional, not human-reviewed graded labels. MRR over retrieved candidates, nDCG uses binary relevance. No source fallback is claimed as a successful semantic measurement.',
  summary: summaryFor(records.filter(r => !r.id.startsWith('CAT'))),
  exact_catalog: { count: identities.length, top1: records.filter(r => r.id.startsWith('CAT') && r.metrics.public?.hit1 === 1).length },
  statuses: Object.fromEntries(['PASS', 'FAIL', 'LIMITATION', 'UNJUDGED'].map(s => [s, records.filter(r => r.status === s).length])),
  records,
};
await write(`${phase}.json`, report);
console.log(JSON.stringify({ summary: report.summary, exact_catalog: report.exact_catalog, statuses: report.statuses }, null, 2));
