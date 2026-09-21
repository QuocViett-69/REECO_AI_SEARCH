import { access, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell !== '')) rows.push(row);
      row = [];
      value = '';
    } else value += character;
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field');
  if (value !== '' || row.length > 0) {
    row.push(value);
    rows.push(row);
  }
  if (rows.length === 0) return [];
  const headers = rows[0].map((header, index) => index === 0 ? header.replace(/^\uFEFF/u, '') : header);
  return rows.slice(1).map((cells, rowIndex) => {
    if (cells.length !== headers.length) throw new Error(`CSV row ${rowIndex + 2} has ${cells.length} fields; expected ${headers.length}`);
    return Object.fromEntries(headers.map((header, index) => [header, cells[index]]));
  });
}

export function findJudgmentConflicts(deterministicJudgments, humanJudgments) {
  const deterministic = new Map(deterministicJudgments.map((item) => [`${item.query_id}\u0000${item.product_id}`, item]));
  return humanJudgments.flatMap((human) => {
    const existing = deterministic.get(`${human.query_id}\u0000${human.product_id}`);
    return existing && existing.relevance !== human.relevance ? [{
      query_id: human.query_id,
      product_id: human.product_id,
      deterministic_judgment: existing.relevance,
      human_judgment: human.relevance,
      evidence_summary: existing.evidence ?? [],
      status: 'NEEDS_RESOLUTION',
    }] : [];
  });
}

export function classifyPositiveSet(query) {
  if (query.judgments.some((item) => item.relevance > 0)) return 'HAS_POSITIVE_SET';
  return query.category === 'negative_or_ambiguous' ? 'INTENTIONAL_NEGATIVE' : 'UNEXPECTED_NO_POSITIVE';
}

export function classifyOpportunity({ relevance, currentRank, retrievalTop20 }, cutoff = 5) {
  if (relevance <= 0) return 'NOT_RELEVANT';
  if (!retrievalTop20) return 'RETRIEVAL_FAILURE';
  if (currentRank === null || currentRank > cutoff) return 'RERANKABLE_FAILURE';
  return 'ALREADY_GOOD';
}

export function validateReview({ benchmark, review, rows, products }) {
  const queryById = new Map(benchmark.queries.map((query) => [query.id, query]));
  const manualQueryById = new Map(review.queries.map((query) => [query.query_id, query]));
  const productById = new Map(products.map((product) => [product.product_id, product]));
  const removedIds = new Set(['CSI_5103', 'CSI_CPEC310', 'CSI_CR1000XE_ST_CC']);
  const expectedPairs = new Set(review.queries.flatMap((query) => query.candidate_pool.map((candidate) => `${query.query_id}\u0000${candidate.product_id}`)));
  const seen = new Set();
  const errors = [];
  const reviewedByQuery = new Map(review.queries.map((query) => [query.query_id, 0]));
  const humanJudgments = [];

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    const pair = `${row.query_id}\u0000${row.product_id}`;
    if (!queryById.has(row.query_id) || !manualQueryById.has(row.query_id)) errors.push({ code: 'orphan_review_row', row: rowNumber, query_id: row.query_id });
    if (!productById.has(row.product_id)) errors.push({ code: 'unknown_product_id', row: rowNumber, product_id: row.product_id });
    else if (productById.get(row.product_id).status !== 'active') errors.push({ code: 'inactive_product', row: rowNumber, product_id: row.product_id });
    if (removedIds.has(row.product_id)) errors.push({ code: 'removed_product', row: rowNumber, product_id: row.product_id });
    if (!expectedPairs.has(pair)) errors.push({ code: 'unexpected_review_pair', row: rowNumber, query_id: row.query_id, product_id: row.product_id });
    if (seen.has(pair)) errors.push({ code: 'duplicate_review_pair', row: rowNumber, query_id: row.query_id, product_id: row.product_id });
    seen.add(pair);

    const raw = row.reviewer_relevance?.trim() ?? '';
    const claimsComplete = /^(?:complete|verified)$/iu.test(row.review_status?.trim() ?? '') || /^(?:true|yes|1)$/iu.test(row.review_complete?.trim() ?? '');
    if (raw === '') {
      if (claimsComplete) errors.push({ code: 'blank_relevance_in_claimed_complete_query', row: rowNumber, query_id: row.query_id });
      continue;
    }
    if (!/^[0-3]$/u.test(raw)) {
      errors.push({ code: 'invalid_relevance', row: rowNumber, value: row.reviewer_relevance });
      continue;
    }
    reviewedByQuery.set(row.query_id, (reviewedByQuery.get(row.query_id) ?? 0) + 1);
    humanJudgments.push({ query_id: row.query_id, product_id: row.product_id, relevance: Number(raw), notes: row.reviewer_notes ?? '' });
  }

  for (const pair of expectedPairs) if (!seen.has(pair)) {
    const [queryId, productId] = pair.split('\u0000');
    errors.push({ code: 'missing_review_row', query_id: queryId, product_id: productId });
  }

  const completeness = review.queries.map((query) => {
    const candidateCount = query.candidate_pool.length;
    const reviewedCandidateCount = reviewedByQuery.get(query.query_id) ?? 0;
    return {
      query_id: query.query_id,
      candidate_count: candidateCount,
      reviewed_candidate_count: reviewedCandidateCount,
      unreviewed_candidate_count: candidateCount - reviewedCandidateCount,
      review_complete: candidateCount === reviewedCandidateCount,
    };
  });
  const deterministicJudgments = benchmark.queries
    .filter((query) => query.judgment_status === 'verified')
    .flatMap((query) => query.judgments.map((item) => ({ query_id: query.id, ...item })));
  const conflicts = findJudgmentConflicts(deterministicJudgments, humanJudgments);
  const complete = completeness.filter((item) => item.review_complete).length;
  const partial = completeness.filter((item) => item.reviewed_candidate_count > 0 && !item.review_complete).length;

  return {
    status: complete === review.queries.length && errors.length === 0 && conflicts.length === 0 ? 'HUMAN_REVIEW_COMPLETE' : 'HUMAN_REVIEW_INCOMPLETE',
    summary: {
      total_benchmark_queries: benchmark.queries.length,
      deterministic_verified_queries: benchmark.queries.filter((query) => query.judgment_status === 'verified').length,
      manual_review_queries: review.queries.length,
      human_verified_queries: complete,
      partially_reviewed_queries: partial,
      unreviewed_queries: completeness.filter((item) => item.reviewed_candidate_count === 0).length,
      candidate_rows: expectedPairs.size,
      reviewed_candidate_rows: humanJudgments.length,
      unreviewed_candidate_rows: expectedPairs.size - humanJudgments.length,
      conflict_count: conflicts.length,
      validation_error_count: errors.length,
    },
    completeness,
    conflicts,
    errors,
  };
}

async function main() {
  const root = path.resolve(import.meta.dirname, '..', '..');
  const readJson = async (...segments) => JSON.parse(await readFile(path.join(root, ...segments), 'utf8'));
  const exists = async (...segments) => access(path.join(root, ...segments)).then(() => true, () => false);
  const [benchmark, review, products, csv] = await Promise.all([
    readJson('data', 'evaluation', 'search-benchmark-v1.json'),
    readJson('data', 'evaluation', 'search-benchmark-review.json'),
    readJson('data', 'master', 'product-master.json'),
    readFile(path.join(root, 'data', 'evaluation', 'search-benchmark-review.csv'), 'utf8'),
  ]);
  const validation = validateReview({ benchmark, review, rows: parseCsv(csv), products });
  const [benchmarkCreated, metricsRecomputed, failuresCreated, opportunitySetCreated] = await Promise.all([
    exists('data', 'evaluation', 'search-benchmark-v1.1.json'),
    exists('data', 'reports', 'search-baseline-v1.1.json'),
    exists('data', 'reports', 'search-failure-cases-v1.1.json'),
    exists('data', 'evaluation', 'reranker-opportunity-set-v1.json'),
  ]);
  const report = {
    schema_version: '1.0',
    report_id: 'search-review-validation-v1.1',
    generated_at: new Date().toISOString(),
    source_benchmark: 'search-benchmark-v1',
    reviewer_label_policy: 'Blank means NOT REVIEWED and is never coerced to zero.',
    ...validation,
    finalization: {
      benchmark_v1_1_created: benchmarkCreated,
      metrics_recomputed: metricsRecomputed,
      failure_cases_v1_1_created: failuresCreated,
      reranker_opportunity_set_created: opportunitySetCreated,
      reason: validation.status === 'HUMAN_REVIEW_COMPLETE' ? 'Review complete; final artifacts are reported above.' : 'Stop condition: every manual-review candidate requires an explicit human label.',
    },
  };
  await writeFile(path.join(root, 'data', 'reports', 'search-review-validation-v1.1.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ status: report.status, ...report.summary, finalization: report.finalization }, null, 2));
  if (report.status !== 'HUMAN_REVIEW_COMPLETE') process.exitCode = 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) await main();
